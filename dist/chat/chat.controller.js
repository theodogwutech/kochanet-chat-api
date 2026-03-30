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
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const chat_service_1 = require("./chat.service");
const create_chat_dto_1 = require("./dto/create-chat.dto");
const add_participants_dto_1 = require("./dto/add-participants.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const response_util_1 = require("../common/utils/response.util");
let ChatController = class ChatController {
    chatService;
    utils;
    constructor(chatService, utils) {
        this.chatService = chatService;
        this.utils = utils;
    }
    async createChat(user, createChatDto, res) {
        const result = await this.chatService.createChat({
            userId: user._id.toString(),
            createChatDto,
        });
        this.utils.apiResponse({
            res,
            success: result.success,
            code: result.code,
            message: result.message,
            data: result.data,
        });
    }
    async getUserChats(user, res) {
        const result = await this.chatService.getUserChats({
            userId: user._id.toString(),
        });
        this.utils.apiResponse({
            res,
            success: result.success,
            code: result.code,
            message: result.message,
            data: result.data,
        });
    }
    async getChatById(chatId, user, res) {
        const result = await this.chatService.getChatById({
            chatId,
            userId: user._id.toString(),
        });
        this.utils.apiResponse({
            res,
            success: result.success,
            code: result.code,
            message: result.message,
            data: result.data,
        });
    }
    async addParticipants(chatId, user, addParticipantsDto, res) {
        const result = await this.chatService.addParticipants({
            chatId,
            userId: user._id.toString(),
            addParticipantsDto,
        });
        this.utils.apiResponse({
            res,
            success: result.success,
            code: result.code,
            message: result.message,
            data: result.data,
        });
    }
    async leaveChat(chatId, user, res) {
        const result = await this.chatService.leaveChat({
            chatId,
            userId: user._id.toString(),
        });
        this.utils.apiResponse({
            res,
            success: result.success,
            code: result.code,
            message: result.message,
        });
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_chat_dto_1.CreateChatDto, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "createChat", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getUserChats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getChatById", null);
__decorate([
    (0, common_1.Patch)(':id/participants'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, add_participants_dto_1.AddParticipantsDto, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "addParticipants", null);
__decorate([
    (0, common_1.Delete)(':id/leave'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "leaveChat", null);
exports.ChatController = ChatController = __decorate([
    (0, common_1.Controller)('chat'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        response_util_1.ResponseUtil])
], ChatController);
//# sourceMappingURL=chat.controller.js.map