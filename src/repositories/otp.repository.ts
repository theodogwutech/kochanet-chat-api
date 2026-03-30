import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, Types } from 'mongoose';
import { OTP_CONFIG } from 'src/common/constants/general.constant';
import { IOtpDocument } from 'src/interfaces/otp.interface';

/**
 * Otp Repository
 */
@Injectable()
export class OtpRepository {
  constructor(
    @InjectModel('Otp') private readonly otpModel: Model<IOtpDocument>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Create otp
   */
  async create(otpData: Partial<IOtpDocument>): Promise<IOtpDocument> {
    const otp = new this.otpModel(otpData);
    return await otp.save();
  }

  /**
   * Find a single otp by query
   */
  async findOne(
    query: FilterQuery<IOtpDocument>,
  ): Promise<IOtpDocument | null> {
    return await this.otpModel.findOne(query).exec();
  }

  /**
   * Find otp by ID
   */
  async findById(id: string): Promise<IOtpDocument | null> {
    return await this.otpModel.findById(id).exec();
  }

  /**
   * Update otp by ID
   */

  async update(
    id: string,
    updateData: Partial<IOtpDocument>,
  ): Promise<IOtpDocument | null> {
    return await this.otpModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async generateOtp({
    userId,
    purpose = 'email_verification',
    expiryMinutes = OTP_CONFIG.EXPIRY_MINUTES,
  }: {
    userId: string;
    purpose?: string;
    expiryMinutes?: number;
  }): Promise<IOtpDocument> {
    const isDevelopment = this.configService.get('NODE_ENV') === 'development';

    const otpCode = isDevelopment
      ? '123456'
      : String(Math.floor(100000 + Math.random() * 900000));

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes);

    const existingOtp = await this.findOne({
      userId,
      purpose,
    });

    if (existingOtp) {
      await this.update(existingOtp.id, {
        otp: otpCode,
        expiresAt,
        isUsed: false,
        attempts: 0,
      });
      const updatedOtp = await this.findOne({
        id: existingOtp.id,
      });

      if (!updatedOtp) {
        throw new Error('Failed to retrieve updated OTP');
      }

      return updatedOtp;
    }

    // Create new OTP
    return await this.create({
      userId: new Types.ObjectId(userId),
      otp: otpCode,
      expiresAt,
      purpose,
      isUsed: false,
      attempts: 0,
    });
  }

  async verifyOtp({
    userId,
    otp,
    purpose = 'email_verification',
  }: {
    userId: string;
    otp: string;
    purpose?: string;
  }) {
    const otpRecord = await this.findOne({
      userId,
      purpose,
    });

    if (!otpRecord) {
      return {
        status: false,
        message: 'Invalid OTP. Please request a new one.',
      };
    }

    if (otpRecord.isUsed) {
      return {
        status: false,
        message: 'This OTP has already been used. Please request a new one.',
      };
    }

    if (otpRecord.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
      return {
        status: false,
        message: 'Too many failed attempts. Please request a new OTP.',
      };
    }

    if (otpRecord.expiresAt < new Date()) {
      return {
        status: false,
        message: 'This OTP has expired. Please request a new one.',
      };
    }

    // Increment attempts
    await this.update(otpRecord.id, {
      attempts: otpRecord.attempts + 1,
    });

    if (otpRecord.otp !== otp) {
      return {
        status: false,
        message: 'Invalid OTP. Please try again.',
      };
    }

    await this.update(otpRecord.id, {
      isUsed: true,
    });

    return {
      status: true,
      message: 'OTP verified successfully',
    };
  }

  /**
   * Delete OTP
   */
  async delete(
    id: FilterQuery<IOtpDocument>,
  ): Promise<{ deletedCount: number }> {
    const result = await this.otpModel.deleteMany(id);
    return { deletedCount: result.deletedCount || 0 };
  }

  /**
   * Delete OTP by user ID
   */
  async deleteByUserId(userId: FilterQuery<IOtpDocument>): Promise<void> {
    await this.delete({ userId });
  }

  /**
   * Clean up expired OTPs
   * Should be run periodically via cron job
   */
  async cleanupExpiredOtps(): Promise<number> {
    const result = await this.delete({
      expiresAt: { $lt: new Date() },
    });
    return result.deletedCount;
  }

  /**
   * Check if user can request new OTP (rate limiting)
   */
  async canRequestNewOtp(userId: string, purpose: string): Promise<boolean> {
    const latestOtp = await this.otpModel
      .findOne({
        userId,
        purpose,
      })
      .sort({ createdAt: -1 })
      .exec();

    if (!latestOtp) {
      return true;
    }

    // Check if cooldown period has passed
    const cooldownSeconds = OTP_CONFIG.RESEND_COOLDOWN_SECONDS;
    const cooldownExpiry = new Date(latestOtp?.createdAt);
    cooldownExpiry.setSeconds(cooldownExpiry.getSeconds() + cooldownSeconds);

    return new Date() > cooldownExpiry;
  }
}
