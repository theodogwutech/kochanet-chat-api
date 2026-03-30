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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const user_interface_1 = require("../interfaces/user.interface");
const response_util_1 = require("../common/utils/response.util");
let UsersController = class UsersController {
    usersService;
    responseUtil;
    constructor(usersService, responseUtil) {
        this.usersService = usersService;
        this.responseUtil = responseUtil;
    }
    async getProfile(user, res) {
        const result = await this.usersService.getProfile({
            userId: user._id.toString(),
        });
        this.responseUtil.apiResponse({
            res,
            success: result.success,
            code: result.code,
            message: result.message,
            data: result.data,
        });
    }
    async updateStatus(user, status, res) {
        const result = await this.usersService.updateStatus({
            userId: user._id.toString(),
            status,
        });
        this.responseUtil.apiResponse({
            res,
            success: result.success,
            code: result.code,
            message: result.message,
            data: result.data,
        });
    }
    async getAllUsers(user, res) {
        const result = await this.usersService.getAllUsers({
            currentUserId: user._id.toString(),
        });
        this.responseUtil.apiResponse({
            res,
            success: result.success,
            code: result.code,
            message: result.message,
            data: result.data,
        });
    }
    async searchUsers(query, user, res) {
        const result = await this.usersService.searchUsers({
            query,
            currentUserId: user._id.toString(),
        });
        this.responseUtil.apiResponse({
            res,
            success: result.success,
            code: result.code,
            message: result.message,
            data: result.data,
        });
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('profile'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)('status'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "searchUsers", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        response_util_1.ResponseUtil])
], UsersController);
//# sourceMappingURL=users.controller.js.map