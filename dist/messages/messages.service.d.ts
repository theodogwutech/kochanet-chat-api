import { HttpStatus } from '@nestjs/common';
import { ChatService } from '../chat/chat.service';
import { MessageRepository } from '../repositories/message.repository';
import { CreateMessageParams, GetMessagesParams, MarkAsReadParams } from './interfaces/message-service.interface';
export declare class MessagesService {
    private messageRepository;
    private chatService;
    constructor(messageRepository: MessageRepository, chatService: ChatService);
    createMessage(params: CreateMessageParams): Promise<{
        success: boolean;
        code: HttpStatus;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        code: HttpStatus;
        message: string;
        data: import("src/interfaces/message.interface").IMessageDocument;
    }>;
    getMessages(params: GetMessagesParams): Promise<{
        success: boolean;
        code: HttpStatus;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        code: HttpStatus;
        message: string;
        data: import("src/interfaces/message.interface").IMessageDocument[];
    }>;
    createAIMessage(chatId: string, content: string, audioUrl?: string): Promise<import("src/interfaces/message.interface").IMessageDocument>;
    markAsRead(params: MarkAsReadParams): Promise<{
        success: boolean;
        code: HttpStatus;
        message: string;
    }>;
    getMessagesWithMention(chatId: string, mention: string, limit?: number): Promise<import("src/interfaces/message.interface").IMessageDocument[]>;
    getRecentMessages(chatId: string, limit?: number): Promise<import("src/interfaces/message.interface").IMessageDocument[]>;
    private extractMentions;
}
