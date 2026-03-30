"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpRepository = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const general_constant_1 = require("../common/constants/general.constant");
let OtpRepository = class OtpRepository {
    otpModel;
    configService;
    constructor(otpModel, configService) {
        this.otpModel = otpModel;
        this.configService = configService;
    }
    async create(otpData) {
        const otp = new this.otpModel(otpData);
        return await otp.save();
    }
    async findOne(query) {
        return await this.otpModel.findOne(query).exec();
    }
    async findById(id) {
        return await this.otpModel.findById(id).exec();
    }
    async update(id, updateData) {
        return await this.otpModel
            .findByIdAndUpdate(id, updateData, { new: true })
            .exec();
    }
    async generateOtp({ userId, purpose = 'email_verification', expiryMinutes = general_constant_1.OTP_CONFIG.EXPIRY_MINUTES, }) {
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
        return await this.create({
            userId: new mongoose_2.Types.ObjectId(userId),
            otp: otpCode,
            expiresAt,
            purpose,
            isUsed: false,
            attempts: 0,
        });
    }
    async verifyOtp({ userId, otp, purpose = 'email_verification', }) {
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
        if (otpRecord.attempts >= general_constant_1.OTP_CONFIG.MAX_ATTEMPTS) {
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
    async delete(id) {
        const result = await this.otpModel.deleteMany(id);
        return { deletedCount: result.deletedCount || 0 };
    }
    async deleteByUserId(userId) {
        await this.delete({ userId });
    }
    async cleanupExpiredOtps() {
        const result = await this.delete({
            expiresAt: { $lt: new Date() },
        });
        return result.deletedCount;
    }
    async canRequestNewOtp(userId, purpose) {
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
        const cooldownSeconds = general_constant_1.OTP_CONFIG.RESEND_COOLDOWN_SECONDS;
        const cooldownExpiry = new Date(latestOtp?.createdAt);
        cooldownExpiry.setSeconds(cooldownExpiry.getSeconds() + cooldownSeconds);
        return new Date() > cooldownExpiry;
    }
};
exports.OtpRepository = OtpRepository;
exports.OtpRepository = OtpRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Otp')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        config_1.ConfigService])
], OtpRepository);
//# sourceMappingURL=otp.repository.js.map