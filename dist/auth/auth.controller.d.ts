import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { ResponseUtil } from 'src/common/utils/response.util';
import { VerifyEmailDto, ResendOtpDto, ForgotPasswordDto, VerifyOtpDto, ResetPasswordDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    private readonly utils;
    constructor(authService: AuthService, utils: ResponseUtil);
    register(registerDto: RegisterDto, res: Response): Promise<void>;
    login(loginDto: LoginDto, res: Response): Promise<void>;
    googleAuth(): Promise<void>;
    googleAuthCallback(req: any, res: Response): Promise<void>;
    verifyEmail(verifyEmailDto: VerifyEmailDto, res: Response): Promise<void>;
    resendOtp(resendOtpDto: ResendOtpDto, res: Response): Promise<void>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto, res: Response): Promise<void>;
    verifyOtp(verifyOtpDto: VerifyOtpDto, res: Response): Promise<void>;
    resetPassword(resetPasswordDto: ResetPasswordDto, res: Response): Promise<void>;
}
