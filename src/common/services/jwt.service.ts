import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface TokenPayload {
  _id: string;
  email: string;
  name: string;
}

interface VerifyTokenResponse {
  success: boolean;
  data?: TokenPayload | Record<string, unknown>;
  message?: string;
}

@Injectable()
export class CustomJwtService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateToken(payload: TokenPayload | Record<string, any>): string {
    try {
      const secret =
        this.configService.get<string>('JWT_SECRET') || 'default-secret';
      const expiresIn =
        this.configService.get<string>('JWT_EXPIRES_IN') || '7d';

      return this.jwtService.sign(payload, {
        secret,
        expiresIn,
      } as JwtSignOptions);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      throw new Error(`Token generation failed: ${errorMessage}`);
    }
  }

  verifyToken(token: string): VerifyTokenResponse {
    try {
      const secret =
        this.configService.get<string>('JWT_SECRET') || 'default-secret';

      const verifyToken = this.jwtService.verify<
        TokenPayload | Record<string, unknown>
      >(token, {
        secret,
      });

      return {
        success: true,
        data: verifyToken,
      };
    } catch {
      return {
        success: false,
        message: 'Invalid or expired token',
      };
    }
  }
}
