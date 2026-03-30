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
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const chat_repository_1 = require("../repositories/chat.repository");
const chat_interface_1 = require("../interfaces/chat.interface");
let ChatService = class ChatService {
    chatRepository;
    constructor(chatRepository) {
        this.chatRepository = chatRepository;
    }
    async createChat(params) {
        try {
            const { userId, createChatDto } = params;
            const { name, type, participants, isPrivate } = createChatDto;
            const participantIds = [...new Set([userId, ...participants])].map((id) => new mongoose_1.Types.ObjectId(id));
            if (type === chat_interface_1.ChatType.DIRECT &&
                participantIds.length !== 2) {
                return {
                    success: false,
                    code: common_1.HttpStatus.BAD_REQUEST,
                    message: 'Direct chats must have exactly 2 participants',
                };
            }
            if (type === chat_interface_1.ChatType.DIRECT) {
                const existingChat = await this.chatRepository.findDirectChat(participantIds[0].toString(), participantIds[1].toString());
                if (existingChat) {
                    return {
                        success: true,
                        code: common_1.HttpStatus.OK,
                        message: 'Direct chat already exists',
                        data: existingChat,
                    };
                }
            }
            const chat = await this.chatRepository.create({
                name,
                type: type || chat_interface_1.ChatType.DIRECT,
                participants: participantIds,
                createdBy: new mongoose_1.Types.ObjectId(userId),
                isPrivate: isPrivate || false,
                lastActivity: new Date(),
            });
            const populatedChat = await this.chatRepository.findByIdWithParticipants(chat._id.toString());
            return {
                success: true,
                code: common_1.HttpStatus.CREATED,
                message: 'Chat created successfully',
                data: populatedChat,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                code: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to create chat: ${errorMessage}`,
            };
        }
    }
    async getUserChats(params) {
        try {
            const { userId } = params;
            const chats = await this.chatRepository.findUserChats(userId);
            return {
                success: true,
                code: common_1.HttpStatus.OK,
                message: 'Chats retrieved successfully',
                data: chats,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                code: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to retrieve chats: ${errorMessage}`,
            };
        }
    }
    async getChatById(params) {
        try {
            const { chatId, userId } = params;
            const chat = await this.chatRepository.findByIdWithParticipants(chatId);
            if (!chat) {
                return {
                    success: false,
                    code: common_1.HttpStatus.NOT_FOUND,
                    message: 'Chat not found',
                };
            }
            const isParticipant = await this.chatRepository.isParticipant(chatId, userId);
            if (!isParticipant) {
                return {
                    success: false,
                    code: common_1.HttpStatus.FORBIDDEN,
                    message: 'You are not a participant of this chat',
                };
            }
            return {
                success: true,
                code: common_1.HttpStatus.OK,
                message: 'Chat retrieved successfully',
                data: chat,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                code: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to retrieve chat: ${errorMessage}`,
            };
        }
    }
    async addParticipants(params) {
        try {
            const { chatId, userId, addParticipantsDto } = params;
            const chat = await this.chatRepository.findById(chatId);
            if (!chat) {
                return {
                    success: false,
                    code: common_1.HttpStatus.NOT_FOUND,
                    message: 'Chat not found',
                };
            }
            const isParticipant = await this.chatRepository.isParticipant(chatId, userId);
            if (!isParticipant) {
                return {
                    success: false,
                    code: common_1.HttpStatus.FORBIDDEN,
                    message: 'You are not a participant of this chat',
                };
            }
            if (chat.type === chat_interface_1.ChatType.DIRECT) {
                return {
                    success: false,
                    code: common_1.HttpStatus.BAD_REQUEST,
                    message: 'Cannot add participants to direct chats',
                };
            }
            const newParticipantIds = addParticipantsDto.participants.map((id) => new mongoose_1.Types.ObjectId(id));
            const updatedChat = await this.chatRepository.addParticipants(chatId, newParticipantIds);
            if (!updatedChat) {
                return {
                    success: false,
                    code: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                    message: 'Failed to add participants',
                };
            }
            return {
                success: true,
                code: common_1.HttpStatus.OK,
                message: 'Participants added successfully',
                data: updatedChat,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                code: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to add participants: ${errorMessage}`,
            };
        }
    }
    async leaveChat(params) {
        try {
            const { chatId, userId } = params;
            const chat = await this.chatRepository.findById(chatId);
            if (!chat) {
                return {
                    success: false,
                    code: common_1.HttpStatus.NOT_FOUND,
                    message: 'Chat not found',
                };
            }
            const isParticipant = await this.chatRepository.isParticipant(chatId, userId);
            if (!isParticipant) {
                return {
                    success: false,
                    code: common_1.HttpStatus.FORBIDDEN,
                    message: 'You are not a participant of this chat',
                };
            }
            await this.chatRepository.removeParticipant(chatId, userId);
            const updatedChat = await this.chatRepository.findById(chatId);
            if (updatedChat && updatedChat.participants.length === 0) {
                await this.chatRepository.update(chatId, { isActive: false });
            }
            return {
                success: true,
                code: common_1.HttpStatus.OK,
                message: 'Left chat successfully',
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                code: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to leave chat: ${errorMessage}`,
            };
        }
    }
    async updateLastActivity(chatId) {
        await this.chatRepository.updateLastActivity(chatId);
    }
    async updateLastMessage(chatId, messageId) {
        await this.chatRepository.updateLastMessage(chatId, messageId);
    }
    async getChatByIdInternal(chatId) {
        return await this.chatRepository.findById(chatId);
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(chat_repository_1.ChatRepository)),
    __metadata("design:paramtypes", [chat_repository_1.ChatRepository])
], ChatService);
//# sourceMappingURL=chat.service.js.map