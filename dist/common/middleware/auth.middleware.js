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
exports.AuthenticationMiddleware = void 0;
const common_1 = require("@nestjs/common");
const user_repository_1 = require("../../repositories/user.repository");
const jwt_service_1 = require("../services/jwt.service");
let AuthenticationMiddleware = class AuthenticationMiddleware {
    customJwtService;
    userRepository;
    constructor(customJwtService, userRepository) {
        this.customJwtService = customJwtService;
        this.userRepository = userRepository;
    }
    async use(req, res, next) {
        const authHeader = req.header('authorization') || req.header('x-auth-token');
        if (!authHeader) {
            return res.status(common_1.HttpStatus.UNAUTHORIZED).json({
                success: false,
                code: common_1.HttpStatus.UNAUTHORIZED,
                message: 'Access denied. No token provided',
            });
        }
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : authHeader;
        try {
            const verifyResult = this.customJwtService.verifyToken(token);
            if (!verifyResult.success || !verifyResult.data) {
                return res.status(common_1.HttpStatus.UNAUTHORIZED).json({
                    success: false,
                    code: common_1.HttpStatus.UNAUTHORIZED,
                    message: verifyResult.message || 'Invalid token',
                });
            }
            const decoded = verifyResult.data;
            req.user = decoded;
            const userId = typeof decoded === 'object' && decoded !== null && '_id' in decoded
                ? decoded._id
                : '';
            const user = await this.userRepository.findById(userId);
            if (!user) {
                return res.status(common_1.HttpStatus.NOT_FOUND).json({
                    success: false,
                    code: common_1.HttpStatus.NOT_FOUND,
                    message: 'User not found',
                });
            }
            if (!user.isActive) {
                return res.status(common_1.HttpStatus.FORBIDDEN).json({
                    success: false,
                    code: common_1.HttpStatus.FORBIDDEN,
                    message: 'Account is inactive',
                });
            }
            next();
        }
        catch {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                code: common_1.HttpStatus.BAD_REQUEST,
                message: 'Invalid token',
            });
        }
    }
};
exports.AuthenticationMiddleware = AuthenticationMiddleware;
exports.AuthenticationMiddleware = AuthenticationMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_service_1.CustomJwtService,
        user_repository_1.UserRepository])
], AuthenticationMiddleware);
//# sourceMappingURL=auth.middleware.js.map