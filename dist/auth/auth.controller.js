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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const auth_dto_1 = require("./dto/auth.dto");
const google_auth_guard_1 = require("../common/guards/google-auth.guard");
const joi_validation_pipe_1 = require("../common/pipes/joi-validation.pipe");
const auth_validation_1 = require("./auth.validation");
const response_util_1 = require("../common/utils/response.util");
const auth_dto_2 = require("./dto/auth.dto");
let AuthController = class AuthController {
    authService;
    utils;
    constructor(authService, utils) {
        this.authService = authService;
        this.utils = utils;
    }
    async register(registerDto, res) {
        const result = await this.authService.register(registerDto);
        this.utils.apiResponse({
            res,
            success: result.success,
            code: result.code,
            message: result.message,
            data: result.data,
        });
    }
    async login(loginDto, res) {
        const result = await this.authService.login(loginDto);
        this.utils.apiResponse({
            res,
            success: result.success,
            code: result.code,
            message: result.message,
            data: result.data,
        });
    }
    async googleAuth() {
    }
    async googleAuthCallback(req, res) {
        const result = await this.authService.googleLogin(req.user);
        if (result.success && result.data?.token) {
            return res.redirect(`/?token=${result.data.token}`);
        }
        else {
            return res.redirect(`/?error=${encodeURIComponent(result.message || 'Authentication failed')}`);
        }
    }
    async verifyEmail(verifyEmailDto, res) {
        const result = await this.authService.verifyEmail(verifyEmailDto);
        this.utils.apiResponse({
            res,
            success: result.success,
            code: result.code,
            message: result.message,
            data: result.data,
        });
    }
    async resendOtp(resendOtpDto, res) {
        const result = await this.authService.resendOtp(resendOtpDto);
        this.utils.apiResponse({
            res,
            success: result.success,
            code: result.code,
            message: result.message,
            data: result.data,
        });
    }
    async forgotPassword(forgotPasswordDto, res) {
        const result = await this.authService.forgotPassword(forgotPasswordDto);
        this.utils.apiResponse({
            res,
            success: result.success,
            code: result.code,
            message: result.message,
            data: result.data,
        });
    }
    async verifyOtp(verifyOtpDto, res) {
        const result = await this.authService.verifyOtp(verifyOtpDto);
        this.utils.apiResponse({
            res,
            success: result.success,
            code: result.code,
            message: result.message,
            data: result.data,
        });
    }
    async resetPassword(resetPasswordDto, res) {
        const result = await this.authService.resetPassword(resetPasswordDto);
        this.utils.apiResponse({
            res,
            success: result.success,
            code: result.code,
            message: result.message,
        });
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)(new joi_validation_pipe_1.JoiValidationPipe(auth_validation_1.RegisterSchema))),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RegisterDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)(new joi_validation_pipe_1.JoiValidationPipe(auth_validation_1.LoginSchema))),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('google'),
    (0, common_1.UseGuards)(google_auth_guard_1.GoogleAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Initiate Google OAuth login' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleAuth", null);
__decorate([
    (0, common_1.Get)('google/callback'),
    (0, common_1.UseGuards)(google_auth_guard_1.GoogleAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Google OAuth callback' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleAuthCallback", null);
__decorate([
    (0, common_1.Post)('verify-email'),
    __param(0, (0, common_1.Body)(new joi_validation_pipe_1.JoiValidationPipe(auth_validation_1.VerifyEmailSchema))),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_2.VerifyEmailDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmail", null);
__decorate([
    (0, common_1.Post)('resend-otp'),
    __param(0, (0, common_1.Body)(new joi_validation_pipe_1.JoiValidationPipe(auth_validation_1.ResendOtpSchema))),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_2.ResendOtpDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resendOtp", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    __param(0, (0, common_1.Body)(new joi_validation_pipe_1.JoiValidationPipe(auth_validation_1.ForgotPasswordSchema))),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_2.ForgotPasswordDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('verify-otp'),
    __param(0, (0, common_1.Body)(new joi_validation_pipe_1.JoiValidationPipe(auth_validation_1.VerifyOtpSchema))),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_2.VerifyOtpDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyOtp", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    __param(0, (0, common_1.Body)(new joi_validation_pipe_1.JoiValidationPipe(auth_validation_1.ResetPasswordSchema))),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_2.ResetPasswordDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        response_util_1.ResponseUtil])
], AuthController);
//# sourceMappingURL=auth.controller.js.map