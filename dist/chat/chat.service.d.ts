import { HttpStatus } from '@nestjs/common';
import { ChatRepository } from '../repositories/chat.repository';
import { CreateChatParams, GetUserChatsParams, GetChatByIdParams, AddParticipantsParams, LeaveChatParams } from './interfaces/chat-service.interface';
import { IChatDocument } from 'src/interfaces/chat.interface';
export declare class ChatService {
    private chatRepository;
    constructor(chatRepository: ChatRepository);
    createChat(params: CreateChatParams): Promise<{
        success: boolean;
        code: HttpStatus;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        code: HttpStatus;
        message: string;
        data: IChatDocument | null;
    }>;
    getUserChats(params: GetUserChatsParams): Promise<{
        success: boolean;
        code: HttpStatus;
        message: string;
        data: IChatDocument[];
    } | {
        success: boolean;
        code: HttpStatus;
        message: string;
        data?: undefined;
    }>;
    getChatById(params: GetChatByIdParams): Promise<{
        success: boolean;
        code: HttpStatus;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        code: HttpStatus;
        message: string;
        data: IChatDocument;
    }>;
    addParticipants(params: AddParticipantsParams): Promise<{
        success: boolean;
        code: HttpStatus;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        code: HttpStatus;
        message: string;
        data: IChatDocument;
    }>;
    leaveChat(params: LeaveChatParams): Promise<{
        success: boolean;
        code: HttpStatus;
        message: string;
    }>;
    updateLastActivity(chatId: string): Promise<void>;
    updateLastMessage(chatId: string, messageId: string): Promise<void>;
    getChatByIdInternal(chatId: string): Promise<IChatDocument | null>;
}
