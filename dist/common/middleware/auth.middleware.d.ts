import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UserRepository } from '../../repositories/user.repository';
import { CustomJwtService } from '../services/jwt.service';
export declare class AuthenticationMiddleware implements NestMiddleware {
    private readonly customJwtService;
    private readonly userRepository;
    constructor(customJwtService: CustomJwtService, userRepository: UserRepository);
    use(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
}
