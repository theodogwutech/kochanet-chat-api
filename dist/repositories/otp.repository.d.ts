import { ConfigService } from '@nestjs/config';
import { Model, FilterQuery } from 'mongoose';
import { IOtpDocument } from 'src/interfaces/otp.interface';
export declare class OtpRepository {
    private readonly otpModel;
    private readonly configService;
    constructor(otpModel: Model<IOtpDocument>, configService: ConfigService);
    create(otpData: Partial<IOtpDocument>): Promise<IOtpDocument>;
    findOne(query: FilterQuery<IOtpDocument>): Promise<IOtpDocument | null>;
    findById(id: string): Promise<IOtpDocument | null>;
    update(id: string, updateData: Partial<IOtpDocument>): Promise<IOtpDocument | null>;
    generateOtp({ userId, purpose, expiryMinutes, }: {
        userId: string;
        purpose?: string;
        expiryMinutes?: number;
    }): Promise<IOtpDocument>;
    verifyOtp({ userId, otp, purpose, }: {
        userId: string;
        otp: string;
        purpose?: string;
    }): Promise<{
        status: boolean;
        message: string;
    }>;
    delete(id: FilterQuery<IOtpDocument>): Promise<{
        deletedCount: number;
    }>;
    deleteByUserId(userId: FilterQuery<IOtpDocument>): Promise<void>;
    cleanupExpiredOtps(): Promise<number>;
    canRequestNewOtp(userId: string, purpose: string): Promise<boolean>;
}
