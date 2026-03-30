import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UserRepository } from '../../repositories/user.repository';
import { CustomJwtService } from '../services/jwt.service';

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  constructor(
    private readonly customJwtService: CustomJwtService,
    private readonly userRepository: UserRepository,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader =
      req.header('authorization') || req.header('x-auth-token');

    if (!authHeader) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        code: HttpStatus.UNAUTHORIZED,
        message: 'Access denied. No token provided',
      });
    }

    // Extract token (handle "Bearer <token>" format)
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;

    try {
      const verifyResult = this.customJwtService.verifyToken(token);

      if (!verifyResult.success || !verifyResult.data) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          code: HttpStatus.UNAUTHORIZED,
          message: verifyResult.message || 'Invalid token',
        });
      }

      const decoded = verifyResult.data;
      req.user = decoded;

      // Verify user exists in database
      const userId =
        typeof decoded === 'object' && decoded !== null && '_id' in decoded
          ? (decoded as any)._id
          : '';
      const user = await this.userRepository.findById(userId);

      if (!user) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          code: HttpStatus.NOT_FOUND,
          message: 'User not found',
        });
      }

      if (!user.isActive) {
        return res.status(HttpStatus.FORBIDDEN).json({
          success: false,
          code: HttpStatus.FORBIDDEN,
          message: 'Account is inactive',
        });
      }

      next();
    } catch {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        code: HttpStatus.BAD_REQUEST,
        message: 'Invalid token',
      });
    }
  }
}
