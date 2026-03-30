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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const user_repository_1 = require("../repositories/user.repository");
const jwt_service_1 = require("../common/services/jwt.service");
const mailer_service_1 = require("../common/services/mailer.service");
const otp_repository_1 = require("../repositories/otp.repository");
const user_interface_1 = require("../interfaces/user.interface");
let AuthService = class AuthService {
    userRepository;
    otpRepository;
    customJwtService;
    mailService;
    constructor(userRepository, otpRepository, customJwtService, mailService) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.customJwtService = customJwtService;
        this.mailService = mailService;
    }
    async register(registerDto) {
        try {
            const { email, password, name } = registerDto;
            const cleanEmail = email.trim().toLowerCase();
            const existingUser = await this.userRepository.findOne({
                email: cleanEmail,
            });
            if (existingUser) {
                return {
                    success: false,
                    code: common_1.HttpStatus.CONFLICT,
                    message: 'Email is already registered',
                };
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await this.userRepository.create({
                email: cleanEmail,
                name,
                password: hashedPassword,
                authProvider: user_interface_1.AuthProvider.LOCAL,
            });
            const otpRecord = await this.otpRepository.generateOtp({
                userId: user._id.toString(),
                purpose: 'email_verification',
            });
            try {
                await this.mailService.sendEmail({
                    to: user.email,
                    subject: 'Verify Your Kochanet Chat Account',
                    templateName: 'verifyAccount',
                    context: {
                        name: user.name,
                        otp: otpRecord.otp,
                        year: new Date().getFullYear(),
                    },
                });
            }
            catch (emailError) {
                console.error('Failed to send verification email:', emailError);
            }
            return {
                success: true,
                code: common_1.HttpStatus.CREATED,
                message: 'User registered successfully. Please check your email for verification code.',
                data: this.sanitizeUser(user),
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                code: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Registration failed: ${errorMessage}`,
            };
        }
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const cleanEmail = email.trim().toLowerCase();
        const user = await this.userRepository.findOne({ email: cleanEmail });
        if (!user) {
            return {
                success: false,
                code: common_1.HttpStatus.UNAUTHORIZED,
                message: 'Invalid credentials',
            };
        }
        if (user.authProvider !== user_interface_1.AuthProvider.LOCAL || !user.password) {
            return {
                success: false,
                code: common_1.HttpStatus.UNAUTHORIZED,
                message: 'Please login using your social authentication provider (e.g., Google)',
            };
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return {
                success: false,
                code: common_1.HttpStatus.UNAUTHORIZED,
                message: 'Invalid credentials',
            };
        }
        if (!user.isEmailVerified) {
            return {
                success: false,
                code: common_1.HttpStatus.FORBIDDEN,
                message: 'Please verify your email before logging in',
            };
        }
        const token = this.generateToken(user);
        return {
            success: true,
            code: common_1.HttpStatus.OK,
            message: 'Login successful',
            data: {
                user: this.sanitizeUser(user),
                token,
            },
        };
    }
    async verifyEmail(verifyEmailDto) {
        try {
            const { email, otp } = verifyEmailDto;
            const cleanEmail = email.trim().toLowerCase();
            const user = await this.userRepository.findOne({ email: cleanEmail });
            if (!user) {
                return {
                    success: false,
                    code: common_1.HttpStatus.NOT_FOUND,
                    message: 'User not found',
                };
            }
            if (user.isEmailVerified) {
                return {
                    success: false,
                    code: common_1.HttpStatus.BAD_REQUEST,
                    message: 'Email is already verified',
                };
            }
            if (!user.isActive) {
                return {
                    success: false,
                    code: common_1.HttpStatus.FORBIDDEN,
                    message: 'Account is inactive. Please contact support.',
                };
            }
            const otpVerification = await this.otpRepository.verifyOtp({
                userId: user._id.toString(),
                otp,
                purpose: 'email_verification',
            });
            if (!otpVerification.status) {
                return {
                    success: false,
                    code: common_1.HttpStatus.BAD_REQUEST,
                    message: otpVerification.message || 'OTP verification failed',
                };
            }
            await this.userRepository.update(user._id.toString(), {
                isEmailVerified: true,
                emailVerifiedAt: new Date(),
            });
            const token = this.generateToken(user);
            return {
                success: true,
                code: common_1.HttpStatus.OK,
                message: 'Email verified successfully',
                data: {
                    token,
                },
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                code: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Email verification failed: ${errorMessage}`,
            };
        }
    }
    async resendOtp(resendOtpDto) {
        try {
            const { email } = resendOtpDto;
            const cleanEmail = email.trim().toLowerCase();
            const user = await this.userRepository.findOne({ email: cleanEmail });
            if (!user) {
                return {
                    success: false,
                    code: common_1.HttpStatus.NOT_FOUND,
                    message: 'User not found',
                };
            }
            if (user.isEmailVerified) {
                return {
                    success: false,
                    code: common_1.HttpStatus.BAD_REQUEST,
                    message: 'Email is already verified',
                };
            }
            if (!user.isActive) {
                return {
                    success: false,
                    code: common_1.HttpStatus.FORBIDDEN,
                    message: 'Account is inactive. Please contact support.',
                };
            }
            const canRequest = await this.otpRepository.canRequestNewOtp(user._id.toString(), 'email_verification');
            if (!canRequest) {
                return {
                    success: false,
                    code: common_1.HttpStatus.TOO_MANY_REQUESTS,
                    message: 'Please wait before requesting a new OTP',
                };
            }
            const otpRecord = await this.otpRepository.generateOtp({
                userId: user._id.toString(),
                purpose: 'email_verification',
            });
            try {
                await this.mailService.sendEmail({
                    to: user.email,
                    subject: 'Your Verification Code - Kochanet Chat',
                    templateName: 'verifyAccount',
                    context: {
                        name: user.name,
                        otp: otpRecord.otp,
                        year: new Date().getFullYear(),
                    },
                });
            }
            catch (emailError) {
                console.error('Failed to send verification email:', emailError);
            }
            return {
                success: true,
                code: common_1.HttpStatus.OK,
                message: 'OTP sent successfully. Please check your email.',
                data: {
                    email: user.email,
                },
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                code: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to resend OTP: ${errorMessage}`,
            };
        }
    }
    async forgotPassword(forgotPasswordDto) {
        try {
            const { email } = forgotPasswordDto;
            const cleanEmail = email.trim().toLowerCase();
            const user = await this.userRepository.findOne({ email: cleanEmail });
            if (!user) {
                return {
                    success: false,
                    code: common_1.HttpStatus.NOT_FOUND,
                    message: 'User not found',
                };
            }
            if (user.authProvider !== user_interface_1.AuthProvider.LOCAL || !user.password) {
                return {
                    success: false,
                    code: common_1.HttpStatus.BAD_REQUEST,
                    message: 'Please use your social authentication provider (e.g., Google) to login',
                };
            }
            if (!user.isEmailVerified) {
                return {
                    success: false,
                    code: common_1.HttpStatus.FORBIDDEN,
                    message: 'Please verify your email first',
                };
            }
            if (!user.isActive) {
                return {
                    success: false,
                    code: common_1.HttpStatus.FORBIDDEN,
                    message: 'Account is inactive. Please contact support.',
                };
            }
            const canRequest = await this.otpRepository.canRequestNewOtp(user._id.toString(), 'password_reset');
            if (!canRequest) {
                return {
                    success: false,
                    code: common_1.HttpStatus.TOO_MANY_REQUESTS,
                    message: 'Please wait before requesting a new OTP',
                };
            }
            const otpRecord = await this.otpRepository.generateOtp({
                userId: user._id.toString(),
                purpose: 'password_reset',
            });
            try {
                await this.mailService.sendEmail({
                    to: user.email,
                    subject: 'Password Reset Code - Kochanet Chat',
                    templateName: 'otpCode',
                    context: {
                        name: user.name,
                        otp: otpRecord.otp,
                        year: new Date().getFullYear(),
                    },
                });
            }
            catch (emailError) {
                console.error('Failed to send password reset email:', emailError);
            }
            return {
                success: true,
                code: common_1.HttpStatus.OK,
                message: 'Password reset OTP sent successfully. Please check your email.',
                data: {
                    email: user.email,
                },
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                code: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to initiate password reset: ${errorMessage}`,
            };
        }
    }
    async verifyOtp(verifyOtpDto) {
        try {
            const { email, otp } = verifyOtpDto;
            const cleanEmail = email.trim().toLowerCase();
            const user = await this.userRepository.findOne({ email: cleanEmail });
            if (!user) {
                return {
                    success: false,
                    code: common_1.HttpStatus.NOT_FOUND,
                    message: 'User not found',
                };
            }
            if (!user.isEmailVerified) {
                return {
                    success: false,
                    code: common_1.HttpStatus.FORBIDDEN,
                    message: 'Please verify your email first',
                };
            }
            if (!user.isActive) {
                return {
                    success: false,
                    code: common_1.HttpStatus.FORBIDDEN,
                    message: 'Account is inactive. Please contact support.',
                };
            }
            const otpVerification = await this.otpRepository.verifyOtp({
                userId: user._id.toString(),
                otp,
                purpose: 'password_reset',
            });
            if (!otpVerification.status) {
                return {
                    success: false,
                    code: common_1.HttpStatus.BAD_REQUEST,
                    message: otpVerification.message || 'OTP verification failed',
                };
            }
            const token = this.customJwtService.generateToken({
                _id: user._id.toString(),
                email: user.email,
                name: user.name,
            });
            return {
                success: true,
                code: common_1.HttpStatus.OK,
                message: 'OTP verified successfully',
                data: {
                    token,
                },
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                code: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: `OTP verification failed: ${errorMessage}`,
            };
        }
    }
    async resetPassword(resetPasswordDto) {
        try {
            const { token, newPassword, confirmPassword } = resetPasswordDto;
            const verifyToken = this.customJwtService.verifyToken(token);
            if (!verifyToken || !verifyToken.data) {
                return {
                    success: false,
                    code: common_1.HttpStatus.UNAUTHORIZED,
                    message: 'Invalid or expired token',
                };
            }
            const cleanEmail = verifyToken.data.email.trim().toLowerCase();
            const user = await this.userRepository.findOne({ email: cleanEmail });
            if (!user) {
                return {
                    success: false,
                    code: common_1.HttpStatus.NOT_FOUND,
                    message: 'User not found',
                };
            }
            if (!user.isEmailVerified) {
                return {
                    success: false,
                    code: common_1.HttpStatus.FORBIDDEN,
                    message: 'Please verify your email first',
                };
            }
            if (!user.isActive) {
                return {
                    success: false,
                    code: common_1.HttpStatus.FORBIDDEN,
                    message: 'Account is inactive. Please contact support.',
                };
            }
            if (newPassword !== confirmPassword) {
                return {
                    success: false,
                    code: common_1.HttpStatus.BAD_REQUEST,
                    message: 'Passwords do not match',
                };
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await this.userRepository.update(user._id.toString(), {
                password: hashedPassword,
            });
            try {
                await this.mailService.sendEmail({
                    to: user.email,
                    subject: 'Password Reset Successful - Kochanet Chat',
                    templateName: 'passwordResetSuccess',
                    context: {
                        name: user.name,
                        year: new Date().getFullYear(),
                    },
                });
            }
            catch (emailError) {
                console.error('Failed to send password reset success email:', emailError);
            }
            return {
                success: true,
                code: common_1.HttpStatus.OK,
                message: 'Success! Your password has been changed.',
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                code: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Password reset failed: ${errorMessage}`,
            };
        }
    }
    async googleLogin(googleUser) {
        if (!googleUser) {
            return {
                success: false,
                code: common_1.HttpStatus.BAD_REQUEST,
                message: 'Google authentication failed',
            };
        }
        const { email, googleId, name, avatar } = googleUser;
        let user = await this.userRepository.findOne({ email });
        if (!user) {
            user = await this.userRepository.create({
                email,
                name,
                googleId,
                avatar,
                authProvider: user_interface_1.AuthProvider.GOOGLE,
            });
        }
        else if (user.authProvider !== user_interface_1.AuthProvider.GOOGLE) {
            user.googleId = googleId;
            user.authProvider = user_interface_1.AuthProvider.GOOGLE;
            if (avatar)
                user.avatar = avatar;
            await user.save();
        }
        const token = this.generateToken(user);
        return {
            success: true,
            code: common_1.HttpStatus.OK,
            message: 'Google login successful',
            data: {
                user: this.sanitizeUser(user),
                token,
            },
        };
    }
    async validateUser(userId) {
        return await this.userRepository.findById(userId);
    }
    generateToken(user) {
        const payload = {
            _id: user._id.toString(),
            email: user.email,
            name: user.name,
        };
        return this.customJwtService.generateToken(payload);
    }
    sanitizeUser(user) {
        const userObject = user.toObject();
        const { password, ...sanitizedUser } = userObject;
        return sanitizedUser;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(user_repository_1.UserRepository)),
    __param(1, (0, common_1.Inject)(otp_repository_1.OtpRepository)),
    __metadata("design:paramtypes", [user_repository_1.UserRepository,
        otp_repository_1.OtpRepository,
        jwt_service_1.CustomJwtService,
        mailer_service_1.MailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map