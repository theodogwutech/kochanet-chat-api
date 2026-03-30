import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { GoogleAuthGuard } from '../common/guards/google-auth.guard';
import { JoiValidationPipe } from 'src/common/pipes/joi-validation.pipe';
import {
  LoginSchema,
  RegisterSchema,
  VerifyEmailSchema,
  ResendOtpSchema,
  ForgotPasswordSchema,
  VerifyOtpSchema,
  ResetPasswordSchema,
} from './auth.validation';
import { ResponseUtil } from 'src/common/utils/response.util';
import {
  VerifyEmailDto,
  ResendOtpDto,
  ForgotPasswordDto,
  VerifyOtpDto,
  ResetPasswordDto,
} from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly utils: ResponseUtil,
  ) {}

  @Post('register')
  async register(
    @Body(new JoiValidationPipe(RegisterSchema)) registerDto: RegisterDto,
    @Res()
    res: Response,
  ) {
    const result = await this.authService.register(registerDto);

    this.utils.apiResponse({
      res,
      success: result.success,
      code: result.code,
      message: result.message,
      data: result.data,
    });
  }

  @Post('login')
  async login(
    @Body(new JoiValidationPipe(LoginSchema)) loginDto: LoginDto,
    @Res() res: Response,
  ) {
    const result = await this.authService.login(loginDto);

    this.utils.apiResponse({
      res,
      success: result.success,
      code: result.code,
      message: result.message,
      data: result.data,
    });
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  async googleAuth() {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleAuthCallback(@Req() req: any, @Res() res: Response) {
    const result = await this.authService.googleLogin(req.user);

    if (result.success && result.data?.token) {
      // Redirect to frontend with token in query params
      return res.redirect(`/?token=${result.data.token}`);
    } else {
      // If login failed, redirect to frontend with error
      return res.redirect(
        `/?error=${encodeURIComponent(result.message || 'Authentication failed')}`,
      );
    }
  }

  @Post('verify-email')
  async verifyEmail(
    @Body(new JoiValidationPipe(VerifyEmailSchema))
    verifyEmailDto: VerifyEmailDto,
    @Res() res: Response,
  ) {
    const result = await this.authService.verifyEmail(verifyEmailDto);

    this.utils.apiResponse({
      res,
      success: result.success,
      code: result.code,
      message: result.message,
      data: result.data,
    });
  }

  @Post('resend-otp')
  async resendOtp(
    @Body(new JoiValidationPipe(ResendOtpSchema)) resendOtpDto: ResendOtpDto,
    @Res() res: Response,
  ) {
    const result = await this.authService.resendOtp(resendOtpDto);

    this.utils.apiResponse({
      res,
      success: result.success,
      code: result.code,
      message: result.message,
      data: result.data,
    });
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body(new JoiValidationPipe(ForgotPasswordSchema))
    forgotPasswordDto: ForgotPasswordDto,
    @Res() res: Response,
  ) {
    const result = await this.authService.forgotPassword(forgotPasswordDto);

    this.utils.apiResponse({
      res,
      success: result.success,
      code: result.code,
      message: result.message,
      data: result.data,
    });
  }

  @Post('verify-otp')
  async verifyOtp(
    @Body(new JoiValidationPipe(VerifyOtpSchema)) verifyOtpDto: VerifyOtpDto,
    @Res() res: Response,
  ) {
    const result = await this.authService.verifyOtp(verifyOtpDto);

    this.utils.apiResponse({
      res,
      success: result.success,
      code: result.code,
      message: result.message,
      data: result.data,
    });
  }

  @Post('reset-password')
  async resetPassword(
    @Body(new JoiValidationPipe(ResetPasswordSchema))
    resetPasswordDto: ResetPasswordDto,
    @Res() res: Response,
  ) {
    const result = await this.authService.resetPassword(resetPasswordDto);

    this.utils.apiResponse({
      res,
      success: result.success,
      code: result.code,
      message: result.message,
    });
  }
}
