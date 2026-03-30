import { Injectable, HttpStatus, Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { UserRepository } from 'src/repositories/user.repository';
import { CustomJwtService } from '../common/services/jwt.service';
import { MailService } from '../common/services/mailer.service';
import { OtpRepository } from 'src/repositories/otp.repository';
import {
  ForgotPasswordDto,
  VerifyEmailDto,
  ResendOtpDto,
  VerifyOtpDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { AuthProvider, IUserDocument } from 'src/interfaces/user.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject(UserRepository) private userRepository: UserRepository,
    @Inject(OtpRepository) private otpRepository: OtpRepository,
    private customJwtService: CustomJwtService,
    private mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      const { email, password, name } = registerDto;

      const cleanEmail = email.trim().toLowerCase();

      const existingUser = await this.userRepository.findOne({
        email: cleanEmail,
      });
      if (existingUser) {
        return {
          success: false,
          code: HttpStatus.CONFLICT,
          message: 'Email is already registered',
        };
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await this.userRepository.create({
        email: cleanEmail,
        name,
        password: hashedPassword,
        authProvider: AuthProvider.LOCAL,
      });

      const otpRecord = await this.otpRepository.generateOtp({
        userId: user._id.toString(),
        purpose: 'email_verification',
      });

      // Send verification email
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
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
      }

      return {
        success: true,
        code: HttpStatus.CREATED,
        message:
          'User registered successfully. Please check your email for verification code.',
        data: this.sanitizeUser(user),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Registration failed: ${errorMessage}`,
      };
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const cleanEmail = email.trim().toLowerCase();

    const user = await this.userRepository.findOne({ email: cleanEmail });
    if (!user) {
      return {
        success: false,
        code: HttpStatus.UNAUTHORIZED,
        message: 'Invalid credentials',
      };
    }

    if (user.authProvider !== AuthProvider.LOCAL || !user.password) {
      return {
        success: false,
        code: HttpStatus.UNAUTHORIZED,
        message:
          'Please login using your social authentication provider (e.g., Google)',
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return {
        success: false,
        code: HttpStatus.UNAUTHORIZED,
        message: 'Invalid credentials',
      };
    }

    if (!user.isEmailVerified) {
      return {
        success: false,
        code: HttpStatus.FORBIDDEN,
        message: 'Please verify your email before logging in',
      };
    }

    const token = this.generateToken(user);

    return {
      success: true,
      code: HttpStatus.OK,
      message: 'Login successful',
      data: {
        user: this.sanitizeUser(user),
        token,
      },
    };
  }

  /**
   * Verify Email
   * Verifies user email with OTP
   */
  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    try {
      const { email, otp } = verifyEmailDto;
      const cleanEmail = email.trim().toLowerCase();

      const user = await this.userRepository.findOne({ email: cleanEmail });
      if (!user) {
        return {
          success: false,
          code: HttpStatus.NOT_FOUND,
          message: 'User not found',
        };
      }

      if (user.isEmailVerified) {
        return {
          success: false,
          code: HttpStatus.BAD_REQUEST,
          message: 'Email is already verified',
        };
      }

      if (!user.isActive) {
        return {
          success: false,
          code: HttpStatus.FORBIDDEN,
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
          code: HttpStatus.BAD_REQUEST,
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
        code: HttpStatus.OK,
        message: 'Email verified successfully',
        data: {
          token,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Email verification failed: ${errorMessage}`,
      };
    }
  }

  /**
   * Resend OTP
   * Resends verification OTP (with rate limiting)
   */
  async resendOtp(resendOtpDto: ResendOtpDto) {
    try {
      const { email } = resendOtpDto;
      const cleanEmail = email.trim().toLowerCase();

      const user = await this.userRepository.findOne({ email: cleanEmail });
      if (!user) {
        return {
          success: false,
          code: HttpStatus.NOT_FOUND,
          message: 'User not found',
        };
      }

      if (user.isEmailVerified) {
        return {
          success: false,
          code: HttpStatus.BAD_REQUEST,
          message: 'Email is already verified',
        };
      }

      if (!user.isActive) {
        return {
          success: false,
          code: HttpStatus.FORBIDDEN,
          message: 'Account is inactive. Please contact support.',
        };
      }

      const canRequest = await this.otpRepository.canRequestNewOtp(
        user._id.toString(),
        'email_verification',
      );

      if (!canRequest) {
        return {
          success: false,
          code: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Please wait before requesting a new OTP',
        };
      }

      const otpRecord = await this.otpRepository.generateOtp({
        userId: user._id.toString(),
        purpose: 'email_verification',
      });

      // Send verification email
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
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Don't fail the request if email sending fails
      }

      return {
        success: true,
        code: HttpStatus.OK,
        message: 'OTP sent successfully. Please check your email.',
        data: {
          email: user.email,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Failed to resend OTP: ${errorMessage}`,
      };
    }
  }

  /**
   * Forgot Password
   * Initiates password reset process
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    try {
      const { email } = forgotPasswordDto;
      const cleanEmail = email.trim().toLowerCase();

      const user = await this.userRepository.findOne({ email: cleanEmail });
      if (!user) {
        return {
          success: false,
          code: HttpStatus.NOT_FOUND,
          message: 'User not found',
        };
      }

      if (user.authProvider !== AuthProvider.LOCAL || !user.password) {
        return {
          success: false,
          code: HttpStatus.BAD_REQUEST,
          message:
            'Please use your social authentication provider (e.g., Google) to login',
        };
      }

      if (!user.isEmailVerified) {
        return {
          success: false,
          code: HttpStatus.FORBIDDEN,
          message: 'Please verify your email first',
        };
      }

      if (!user.isActive) {
        return {
          success: false,
          code: HttpStatus.FORBIDDEN,
          message: 'Account is inactive. Please contact support.',
        };
      }

      const canRequest = await this.otpRepository.canRequestNewOtp(
        user._id.toString(),
        'password_reset',
      );

      if (!canRequest) {
        return {
          success: false,
          code: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Please wait before requesting a new OTP',
        };
      }

      const otpRecord = await this.otpRepository.generateOtp({
        userId: user._id.toString(),
        purpose: 'password_reset',
      });

      // Send password reset email
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
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        // Don't fail the request if email sending fails
      }

      return {
        success: true,
        code: HttpStatus.OK,
        message:
          'Password reset OTP sent successfully. Please check your email.',
        data: {
          email: user.email,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Failed to initiate password reset: ${errorMessage}`,
      };
    }
  }

  /**
   * Verify OTP
   * Verifies OTP for password reset
   */
  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    try {
      const { email, otp } = verifyOtpDto;
      const cleanEmail = email.trim().toLowerCase();

      const user = await this.userRepository.findOne({ email: cleanEmail });
      if (!user) {
        return {
          success: false,
          code: HttpStatus.NOT_FOUND,
          message: 'User not found',
        };
      }

      if (!user.isEmailVerified) {
        return {
          success: false,
          code: HttpStatus.FORBIDDEN,
          message: 'Please verify your email first',
        };
      }

      if (!user.isActive) {
        return {
          success: false,
          code: HttpStatus.FORBIDDEN,
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
          code: HttpStatus.BAD_REQUEST,
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
        code: HttpStatus.OK,
        message: 'OTP verified successfully',
        data: {
          token,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `OTP verification failed: ${errorMessage}`,
      };
    }
  }

  /**
   * Reset Password
   * Completes password reset process
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      const { token, newPassword, confirmPassword } = resetPasswordDto;

      // Verify the JWT token
      const verifyToken: any = this.customJwtService.verifyToken(token);

      if (!verifyToken || !verifyToken.data) {
        return {
          success: false,
          code: HttpStatus.UNAUTHORIZED,
          message: 'Invalid or expired token',
        };
      }

      const cleanEmail = verifyToken.data.email.trim().toLowerCase();

      const user = await this.userRepository.findOne({ email: cleanEmail });
      if (!user) {
        return {
          success: false,
          code: HttpStatus.NOT_FOUND,
          message: 'User not found',
        };
      }

      if (!user.isEmailVerified) {
        return {
          success: false,
          code: HttpStatus.FORBIDDEN,
          message: 'Please verify your email first',
        };
      }

      if (!user.isActive) {
        return {
          success: false,
          code: HttpStatus.FORBIDDEN,
          message: 'Account is inactive. Please contact support.',
        };
      }

      if (newPassword !== confirmPassword) {
        return {
          success: false,
          code: HttpStatus.BAD_REQUEST,
          message: 'Passwords do not match',
        };
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await this.userRepository.update(user._id.toString(), {
        password: hashedPassword,
      });

      // Send password reset success email
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
      } catch (emailError) {
        console.error(
          'Failed to send password reset success email:',
          emailError,
        );
        // Don't fail the request if email sending fails
      }

      return {
        success: true,
        code: HttpStatus.OK,
        message: 'Success! Your password has been changed.',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Password reset failed: ${errorMessage}`,
      };
    }
  }

  async googleLogin(googleUser: {
    email: string;
    googleId: string;
    name: string;
    avatar?: string;
  }) {
    if (!googleUser) {
      return {
        success: false,
        code: HttpStatus.BAD_REQUEST,
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
        authProvider: AuthProvider.GOOGLE,
      });
    } else if (user.authProvider !== AuthProvider.GOOGLE) {
      user.googleId = googleId;
      user.authProvider = AuthProvider.GOOGLE;
      if (avatar) user.avatar = avatar;
      await user.save();
    }

    const token = this.generateToken(user);

    return {
      success: true,
      code: HttpStatus.OK,
      message: 'Google login successful',
      data: {
        user: this.sanitizeUser(user),
        token,
      },
    };
  }

  async validateUser(userId: string): Promise<IUserDocument | null> {
    return await this.userRepository.findById(userId);
  }

  private generateToken(user: IUserDocument): string {
    const payload = {
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
    };

    return this.customJwtService.generateToken(payload);
  }

  private sanitizeUser(user: IUserDocument): Omit<IUserDocument, 'password'> {
    const userObject = user.toObject() as IUserDocument;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...sanitizedUser } = userObject;
    return sanitizedUser as Omit<IUserDocument, 'password'>;
  }
}
