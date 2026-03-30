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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomJwtService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
let CustomJwtService = class CustomJwtService {
    jwtService;
    configService;
    constructor(jwtService, configService) {
        this.jwtService = jwtService;
        this.configService = configService;
    }
    generateToken(payload) {
        try {
            const secret = this.configService.get('JWT_SECRET') || 'default-secret';
            const expiresIn = this.configService.get('JWT_EXPIRES_IN') || '7d';
            return this.jwtService.sign(payload, {
                secret,
                expiresIn,
            });
        }
        catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Unknown error';
            throw new Error(`Token generation failed: ${errorMessage}`);
        }
    }
    verifyToken(token) {
        try {
            const secret = this.configService.get('JWT_SECRET') || 'default-secret';
            const verifyToken = this.jwtService.verify(token, {
                secret,
            });
            return {
                success: true,
                data: verifyToken,
            };
        }
        catch {
            return {
                success: false,
                message: 'Invalid or expired token',
            };
        }
    }
};
exports.CustomJwtService = CustomJwtService;
exports.CustomJwtService = CustomJwtService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService])
], CustomJwtService);
//# sourceMappingURL=jwt.service.js.map