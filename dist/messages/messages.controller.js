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
exports.MessagesController = void 0;
const common_1 = require("@nestjs/common");
const messages_service_1 = require("./messages.service");
const create_message_dto_1 = require("./dto/create-message.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const response_util_1 = require("../common/utils/response.util");
let MessagesController = class MessagesController {
    messagesService;
    utils;
    constructor(messagesService, utils) {
        this.messagesService = messagesService;
        this.utils = utils;
    }
    async createMessage(user, createMessageDto, res) {
        const result = await this.messagesService.createMessage({
            userId: user._id.toString(),
            createMessageDto,
        });
        this.utils.apiResponse({
            res,
            success: result.success,
            code: result.code,
            message: result.message,
            data: result.data,
        });
    }
    async getMessages(res, user, chatId, limit, skip) {
        const result = await this.messagesService.getMessages({
            chatId,
            userId: user._id.toString(),
            limit,
            skip,
        });
        this.utils.apiResponse({
            res,
            success: result.success,
            code: result.code,
            message: result.message,
            data: result.data,
        });
    }
    async markAsRead(messageId, user, res) {
        const result = await this.messagesService.markAsRead({
            messageId,
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
exports.MessagesController = MessagesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_message_dto_1.CreateMessageDto, Object]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "createMessage", null);
__decorate([
    (0, common_1.Get)('chat/:chatId'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Param)('chatId')),
    __param(3, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __param(4, (0, common_1.Query)('skip', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, Number, Number]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Patch)(':id/read'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "markAsRead", null);
exports.MessagesController = MessagesController = __decorate([
    (0, common_1.Controller)('messages'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [messages_service_1.MessagesService,
        response_util_1.ResponseUtil])
], MessagesController);
//# sourceMappingURL=messages.controller.js.map