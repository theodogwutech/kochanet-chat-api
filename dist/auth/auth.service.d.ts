import { HttpStatus } from '@nestjs/common';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { UserRepository } from 'src/repositories/user.repository';
import { CustomJwtService } from '../common/services/jwt.service';
import { MailService } from '../common/services/mailer.service';
import { OtpRepository } from 'src/repositories/otp.repository';
import { ForgotPasswordDto, VerifyEmailDto, ResendOtpDto, VerifyOtpDto, ResetPasswordDto } from './dto/auth.dto';
import { IUserDocument } from 'src/interfaces/user.interface';
export declare class AuthService {
    private userRepository;
    private otpRepository;
    private customJwtService;
    private mailService;
    constructor(userRepository: UserRepository, otpRepository: OtpRepository, customJwtService: CustomJwtService, mailService: MailService);
    register(registerDto: RegisterDto): Promise<{
        success: boolean;
        code: HttpStatus;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        code: HttpStatus;
        message: string;
        data: Omit<IUserDocument, "password">;
    }>;
    login(loginDto: LoginDto): Promise<{
        success: boolean;
        code: HttpStatus;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        code: HttpStatus;
        message: string;
        data: {
            user: Omit<IUserDocument, "password">;
            token: string;
        };
    }>;
    verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<{
        success: boolean;
        code: HttpStatus;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        code: HttpStatus;
        message: string;
        data: {
            token: string;
        };
    }>;
    resendOtp(resendOtpDto: ResendOtpDto): Promise<{
        success: boolean;
        code: HttpStatus;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        code: HttpStatus;
        message: string;
        data: {
            email: string;
        };
    }>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        success: boolean;
        code: HttpStatus;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        code: HttpStatus;
        message: string;
        data: {
            email: string;
        };
    }>;
    verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{
        success: boolean;
        code: HttpStatus;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        code: HttpStatus;
        message: string;
        data: {
            token: string;
        };
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        success: boolean;
        code: HttpStatus;
        message: string;
    }>;
    googleLogin(googleUser: {
        email: string;
        googleId: string;
        name: string;
        avatar?: string;
    }): Promise<{
        success: boolean;
        code: HttpStatus;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        code: HttpStatus;
        message: string;
        data: {
            user: Omit<IUserDocument, "password">;
            token: string;
        };
    }>;
    validateUser(userId: string): Promise<IUserDocument | null>;
    private generateToken;
    private sanitizeUser;
}
