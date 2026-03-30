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
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const common_1 = require("@nestjs/common");
const messages_service_1 = require("../messages/messages.service");
const ai_service_1 = require("../ai/ai.service");
const users_service_1 = require("../users/users.service");
const user_interface_1 = require("../interfaces/user.interface");
const create_message_dto_1 = require("../messages/dto/create-message.dto");
let ChatGateway = class ChatGateway {
    jwtService;
    messagesService;
    aiService;
    usersService;
    server;
    userSockets = new Map();
    typingUsers = new Map();
    constructor(jwtService, messagesService, aiService, usersService) {
        this.jwtService = jwtService;
        this.messagesService = messagesService;
        this.aiService = aiService;
        this.usersService = usersService;
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth.token ||
                client.handshake.headers.authorization?.split(' ')[1];
            console.log('Token received:', token ? 'Yes' : 'No');
            if (!token) {
                console.log('No token provided, disconnecting client');
                client.disconnect();
                return;
            }
            const payload = this.jwtService.verify(token);
            console.log('JWT Payload:', JSON.stringify(payload, null, 2));
            client.userId = payload._id || payload.sub || payload.userId;
            console.log('Extracted userId:', client.userId);
            if (client.userId) {
                const userSockets = this.userSockets.get(client.userId) || [];
                userSockets.push(client.id);
                this.userSockets.set(client.userId, userSockets);
                await this.usersService.updateStatus({
                    userId: client.userId,
                    status: user_interface_1.UserStatus.ONLINE,
                });
                this.server.emit('user:status', {
                    userId: client.userId,
                    status: user_interface_1.UserStatus.ONLINE,
                });
            }
            console.log(`Client connected: ${client.id}, User: ${client.userId}`);
        }
        catch (error) {
            console.error('Connection error:', error);
            console.error('Error details:', error.message);
            client.disconnect();
        }
    }
    async handleDisconnect(client) {
        if (client.userId) {
            const userSockets = this.userSockets.get(client.userId) || [];
            const updatedSockets = userSockets.filter((id) => id !== client.id);
            if (updatedSockets.length === 0) {
                this.userSockets.delete(client.userId);
                await this.usersService.updateStatus({
                    userId: client.userId,
                    status: user_interface_1.UserStatus.OFFLINE,
                });
                this.server.emit('user:status', {
                    userId: client.userId,
                    status: user_interface_1.UserStatus.OFFLINE,
                });
            }
            else {
                this.userSockets.set(client.userId, updatedSockets);
            }
            console.log(`Client disconnected: ${client.id}, User: ${client.userId}`);
        }
    }
    handleJoinChat(client, data) {
        client.join(`chat:${data.chatId}`);
        console.log(`User ${client.userId} joined chat ${data.chatId}`);
        return {
            event: 'chat:joined',
            data: { chatId: data.chatId },
        };
    }
    handleLeaveChat(client, data) {
        client.leave(`chat:${data.chatId}`);
        console.log(`User ${client.userId} left chat ${data.chatId}`);
        return {
            event: 'chat:left',
            data: { chatId: data.chatId },
        };
    }
    async handleMessage(client, createMessageDto) {
        try {
            const userId = client.userId;
            if (!userId) {
                return { event: 'error', data: { message: 'Unauthorized' } };
            }
            const result = await this.messagesService.createMessage({
                userId,
                createMessageDto,
            });
            const message = result.data;
            this.server
                .to(`chat:${createMessageDto.chatId}`)
                .emit('message:new', message);
            if (this.aiService.checkForAIMention(createMessageDto.content)) {
                this.handleAIMention(createMessageDto.chatId, message);
            }
            return {
                event: 'message:sent',
                data: message,
            };
        }
        catch (error) {
            console.error('Error sending message:', error);
            return {
                event: 'error',
                data: { message: error.message },
            };
        }
    }
    async handleTypingStart(client, data) {
        const userId = client.userId;
        if (!userId)
            return;
        if (!this.typingUsers.has(data.chatId)) {
            this.typingUsers.set(data.chatId, new Set());
        }
        this.typingUsers.get(data.chatId)?.add(userId);
        const user = await this.usersService.getUserById(userId);
        client.to(`chat:${data.chatId}`).emit('typing:start', {
            chatId: data.chatId,
            userId,
            userName: user?.name,
        });
    }
    handleTypingStop(client, data) {
        const userId = client.userId;
        if (!userId)
            return;
        this.typingUsers.get(data.chatId)?.delete(userId);
        client.to(`chat:${data.chatId}`).emit('typing:stop', {
            chatId: data.chatId,
            userId,
        });
    }
    async handleAIMention(chatId, message) {
        try {
            this.server.to(`chat:${chatId}`).emit('typing:start', {
                chatId,
                userId: 'ai',
                userName: 'AI Assistant',
            });
            const aiResult = await this.aiService.processAIMention(chatId, message);
            this.server.to(`chat:${chatId}`).emit('typing:stop', {
                chatId,
                userId: 'ai',
            });
            if (aiResult.success) {
                this.server.to(`chat:${chatId}`).emit('message:new', aiResult.data);
            }
        }
        catch (error) {
            console.error('Error handling AI mention:', error);
            this.server.to(`chat:${chatId}`).emit('typing:stop', {
                chatId,
                userId: 'ai',
            });
        }
    }
    notifyNewChat(participants, chatData) {
        participants.forEach((userId) => {
            const socketIds = this.userSockets.get(userId);
            if (socketIds) {
                socketIds.forEach((socketId) => {
                    this.server.to(socketId).emit('chat:new', chatData);
                });
            }
        });
    }
    notifyChatUpdate(participants, chatData) {
        participants.forEach((userId) => {
            const socketIds = this.userSockets.get(userId);
            if (socketIds) {
                socketIds.forEach((socketId) => {
                    this.server.to(socketId).emit('chat:updated', chatData);
                });
            }
        });
    }
    broadcastMessage(chatId, message) {
        console.log(`Broadcasting message to chat:${chatId}`, message._id);
        this.server.to(`chat:${chatId}`).emit('message:new', message);
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('chat:join'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleJoinChat", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('chat:leave'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleLeaveChat", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('message:send'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_message_dto_1.CreateMessageDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing:start'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleTypingStart", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing:stop'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleTypingStop", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
            credentials: true,
        },
        namespace: '/chat',
    }),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => ai_service_1.AIService))),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        messages_service_1.MessagesService,
        ai_service_1.AIService,
        users_service_1.UsersService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map