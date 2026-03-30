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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const user_repository_1 = require("../repositories/user.repository");
const constants_1 = require("../common/constants");
let UsersService = class UsersService {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async getProfile(params) {
        const { userId } = params;
        const user = await this.userRepository.findById(userId);
        if (!user) {
            return {
                success: false,
                code: common_1.HttpStatus.NOT_FOUND,
                message: constants_1.ERROR_MESSAGES.USER_NOT_FOUND,
            };
        }
        return {
            success: true,
            code: common_1.HttpStatus.OK,
            message: constants_1.SUCCESS_MESSAGES.PROFILE_RETRIEVED,
            data: user,
        };
    }
    async updateStatus(params) {
        const { userId, status } = params;
        const user = await this.userRepository.updateStatus(userId, status);
        if (!user) {
            return {
                success: false,
                code: common_1.HttpStatus.NOT_FOUND,
                message: constants_1.ERROR_MESSAGES.USER_NOT_FOUND,
            };
        }
        return {
            success: true,
            code: common_1.HttpStatus.OK,
            message: constants_1.SUCCESS_MESSAGES.STATUS_UPDATED,
            data: user,
        };
    }
    async getAllUsers(params) {
        const { currentUserId } = params;
        const users = await this.userRepository.getAllExceptCurrent(currentUserId);
        return {
            success: true,
            code: common_1.HttpStatus.OK,
            message: constants_1.SUCCESS_MESSAGES.USERS_RETRIEVED,
            data: users,
        };
    }
    async searchUsers(params) {
        const { query, currentUserId } = params;
        const users = await this.userRepository.search(query, currentUserId);
        return {
            success: true,
            code: common_1.HttpStatus.OK,
            message: constants_1.SUCCESS_MESSAGES.SEARCH_RESULTS_RETRIEVED,
            data: users,
        };
    }
    async getUserById(userId) {
        return await this.userRepository.findById(userId);
    }
    async getUsersByIds(userIds) {
        return await this.userRepository.findByIds(userIds);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(user_repository_1.UserRepository)),
    __metadata("design:paramtypes", [user_repository_1.UserRepository])
], UsersService);
//# sourceMappingURL=users.service.js.map