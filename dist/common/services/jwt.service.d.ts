import { JwtService } from '@nestjs/jwt';
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
export declare class CustomJwtService {
    private readonly jwtService;
    private readonly configService;
    constructor(jwtService: JwtService, configService: ConfigService);
    generateToken(payload: TokenPayload | Record<string, any>): string;
    verifyToken(token: string): VerifyTokenResponse;
}
export {};
