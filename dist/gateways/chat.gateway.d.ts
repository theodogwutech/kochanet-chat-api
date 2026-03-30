import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { MessagesService } from '../messages/messages.service';
import { AIService } from '../ai/ai.service';
import { UsersService } from '../users/users.service';
import { CreateMessageDto } from '../messages/dto/create-message.dto';
interface AuthenticatedSocket extends Socket {
    userId?: string;
}
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private messagesService;
    private aiService;
    private usersService;
    server: Server;
    private userSockets;
    private typingUsers;
    constructor(jwtService: JwtService, messagesService: MessagesService, aiService: AIService, usersService: UsersService);
    handleConnection(client: AuthenticatedSocket): Promise<void>;
    handleDisconnect(client: AuthenticatedSocket): Promise<void>;
    handleJoinChat(client: AuthenticatedSocket, data: {
        chatId: string;
    }): {
        event: string;
        data: {
            chatId: string;
        };
    };
    handleLeaveChat(client: AuthenticatedSocket, data: {
        chatId: string;
    }): {
        event: string;
        data: {
            chatId: string;
        };
    };
    handleMessage(client: AuthenticatedSocket, createMessageDto: CreateMessageDto): Promise<{
        event: string;
        data: import("../interfaces/message.interface").IMessageDocument | undefined;
    } | {
        event: string;
        data: {
            message: any;
        };
    }>;
    handleTypingStart(client: AuthenticatedSocket, data: {
        chatId: string;
    }): Promise<void>;
    handleTypingStop(client: AuthenticatedSocket, data: {
        chatId: string;
    }): void;
    private handleAIMention;
    notifyNewChat(participants: string[], chatData: any): void;
    notifyChatUpdate(participants: string[], chatData: any): void;
    broadcastMessage(chatId: string, message: any): void;
}
export {};
