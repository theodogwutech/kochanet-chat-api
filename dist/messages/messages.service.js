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
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const chat_service_1 = require("../chat/chat.service");
const message_repository_1 = require("../repositories/message.repository");
const message_interface_1 = require("../interfaces/message.interface");
let MessagesService = class MessagesService {
    messageRepository;
    chatService;
    constructor(messageRepository, chatService) {
        this.messageRepository = messageRepository;
        this.chatService = chatService;
    }
    async createMessage(params) {
        try {
            const { userId, createMessageDto } = params;
            const { chatId, content, type, audioUrl } = createMessageDto;
            const chat = await this.chatService.getChatByIdInternal(chatId);
            if (!chat) {
                return {
                    success: false,
                    code: common_1.HttpStatus.NOT_FOUND,
                    message: 'Chat not found',
                };
            }
            const isParticipant = chat.participants.some((p) => p.toString() === userId);
            if (!isParticipant) {
                return {
                    success: false,
                    code: common_1.HttpStatus.FORBIDDEN,
                    message: 'You are not a participant of this chat',
                };
            }
            const mentions = this.extractMentions(content);
            const message = await this.messageRepository.create({
                chatId: new mongoose_1.Types.ObjectId(chatId),
                senderId: new mongoose_1.Types.ObjectId(userId),
                content,
                type: type || message_interface_1.MessageType.TEXT,
                audioUrl,
                mentions,
                isAI: false,
            });
            await this.chatService.updateLastMessage(chatId, message._id.toString());
            return {
                success: true,
                code: common_1.HttpStatus.CREATED,
                message: 'Message sent successfully',
                data: message,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                code: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to create message: ${errorMessage}`,
            };
        }
    }
    async getMessages(params) {
        try {
            const { chatId, userId, limit = 50, skip = 0 } = params;
            const chat = await this.chatService.getChatByIdInternal(chatId);
            if (!chat) {
                return {
                    success: false,
                    code: common_1.HttpStatus.NOT_FOUND,
                    message: 'Chat not found',
                };
            }
            const isParticipant = chat.participants.some((p) => p.toString() === userId);
            if (!isParticipant) {
                return {
                    success: false,
                    code: common_1.HttpStatus.FORBIDDEN,
                    message: 'You are not a participant of this chat',
                };
            }
            const messages = await this.messageRepository.findByChatId(chatId, limit, skip);
            return {
                success: true,
                code: common_1.HttpStatus.OK,
                message: 'Messages retrieved successfully',
                data: messages.reverse(),
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                code: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to retrieve messages: ${errorMessage}`,
            };
        }
    }
    async createAIMessage(chatId, content, audioUrl) {
        const message = await this.messageRepository.create({
            chatId: new mongoose_1.Types.ObjectId(chatId),
            senderId: new mongoose_1.Types.ObjectId('000000000000000000000000'),
            content,
            type: audioUrl ? message_interface_1.MessageType.VOICE : message_interface_1.MessageType.TEXT,
            audioUrl,
            isAI: true,
            mentions: [],
        });
        await this.chatService.updateLastMessage(chatId, message._id.toString());
        return message;
    }
    async markAsRead(params) {
        try {
            const { messageId, userId } = params;
            const message = await this.messageRepository.findById(messageId);
            if (!message) {
                return {
                    success: false,
                    code: common_1.HttpStatus.NOT_FOUND,
                    message: 'Message not found',
                };
            }
            await this.messageRepository.markAsRead(messageId, userId);
            return {
                success: true,
                code: common_1.HttpStatus.OK,
                message: 'Message marked as read',
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                code: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to mark message as read: ${errorMessage}`,
            };
        }
    }
    async getMessagesWithMention(chatId, mention, limit = 20) {
        return await this.messageRepository.findByMention(chatId, mention, limit);
    }
    async getRecentMessages(chatId, limit = 20) {
        return await this.messageRepository.getRecentMessages(chatId, limit);
    }
    extractMentions(content) {
        const mentionRegex = /@(\w+)/g;
        const mentions = [];
        let match;
        while ((match = mentionRegex.exec(content)) !== null) {
            mentions.push(match[1].toLowerCase());
        }
        return [...new Set(mentions)];
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(message_repository_1.MessageRepository)),
    __metadata("design:paramtypes", [message_repository_1.MessageRepository,
        chat_service_1.ChatService])
], MessagesService);
//# sourceMappingURL=messages.service.js.map