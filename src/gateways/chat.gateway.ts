import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Inject, forwardRef } from '@nestjs/common';
import { MessagesService } from '../messages/messages.service';
import { AIService } from '../ai/ai.service';
import { UsersService } from '../users/users.service';
import { ChatService } from '../chat/chat.service';
import { UserStatus } from '../interfaces/user.interface';
import { CreateMessageDto } from '../messages/dto/create-message.dto';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private userSockets: Map<string, string[]> = new Map(); // userId -> socket IDs
  private typingUsers: Map<string, Set<string>> = new Map(); // chatId -> Set of userIds

  constructor(
    private jwtService: JwtService,
    private messagesService: MessagesService,
    @Inject(forwardRef(() => AIService))
    private aiService: AIService,
    private usersService: UsersService,
    private chatService: ChatService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from handshake
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.split(' ')[1];

      console.log('Token received:', token ? 'Yes' : 'No');

      if (!token) {
        console.log('❌ No token provided, disconnecting client');
        client.emit('error', {
          message: 'Authentication required. Please login.',
          code: 'NO_TOKEN',
        });
        client.disconnect();
        return;
      }

      // Verify token
      const payload: any = this.jwtService.verify(token);
      console.log('✅ JWT verified successfully');
      console.log('JWT Payload:', JSON.stringify(payload, null, 2));

      // Try to extract user ID from various possible fields
      client.userId = payload._id || payload.sub || payload.userId;
      console.log('Extracted userId:', client.userId);

      // Track user socket
      if (client.userId) {
        const userSockets = this.userSockets.get(client.userId) || [];
        userSockets.push(client.id);
        this.userSockets.set(client.userId, userSockets);

        // Update user status to online
        await this.usersService.updateStatus({
          userId: client.userId,
          status: UserStatus.ONLINE,
        });

        // Broadcast user online status
        this.server.emit('user:status', {
          userId: client.userId,
          status: UserStatus.ONLINE,
        });
      }

      console.log(`✅ Client connected: ${client.id}, User: ${client.userId}`);
    } catch (error) {
      console.error('❌ Connection error:', error.name);
      console.error('Error details:', error.message);

      // Provide specific error messages based on error type
      if (error.name === 'JsonWebTokenError') {
        client.emit('error', {
          message:
            'Invalid token. Please login again with the correct credentials.',
          code: 'INVALID_TOKEN',
          details:
            'Token signature mismatch - you may be using a token from a different environment.',
        });
      } else if (error.name === 'TokenExpiredError') {
        client.emit('error', {
          message: 'Your session has expired. Please login again.',
          code: 'TOKEN_EXPIRED',
        });
      } else {
        client.emit('error', {
          message: 'Authentication failed. Please try again.',
          code: 'AUTH_ERROR',
        });
      }

      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      // Remove socket from user's socket list
      const userSockets = this.userSockets.get(client.userId) || [];
      const updatedSockets = userSockets.filter((id) => id !== client.id);

      if (updatedSockets.length === 0) {
        // User has no more connections, set to offline
        this.userSockets.delete(client.userId);
        await this.usersService.updateStatus({
          userId: client.userId,
          status: UserStatus.OFFLINE,
        });

        // Broadcast user offline status
        this.server.emit('user:status', {
          userId: client.userId,
          status: UserStatus.OFFLINE,
        });
      } else {
        this.userSockets.set(client.userId, updatedSockets);
      }

      console.log(`Client disconnected: ${client.id}, User: ${client.userId}`);
    }
  }

  @SubscribeMessage('chat:join')
  handleJoinChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string },
  ) {
    client.join(`chat:${data.chatId}`);
    console.log(`User ${client.userId} joined chat ${data.chatId}`);

    return {
      event: 'chat:joined',
      data: { chatId: data.chatId },
    };
  }

  @SubscribeMessage('chat:leave')
  handleLeaveChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string },
  ) {
    client.leave(`chat:${data.chatId}`);
    console.log(`User ${client.userId} left chat ${data.chatId}`);

    return {
      event: 'chat:left',
      data: { chatId: data.chatId },
    };
  }

  @SubscribeMessage('message:send')
  async handleMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() createMessageDto: CreateMessageDto,
  ) {
    try {
      const userId = client.userId;
      if (!userId) {
        return { event: 'error', data: { message: 'Unauthorized' } };
      }

      // Create message
      const result = await this.messagesService.createMessage({
        userId,
        createMessageDto,
      });
      const message = result.data;

      // Broadcast message to chat room
      this.server
        .to(`chat:${createMessageDto.chatId}`)
        .emit('message:new', message);

      // Send mention notifications to mentioned users
      if (message && message.mentions && message.mentions.length > 0) {
        await this.notifyMentionedUsers(message, userId);
      }

      // Check for AI mention
      if (this.aiService.checkForAIMention(createMessageDto.content)) {
        // Process AI response asynchronously
        this.handleAIMention(createMessageDto.chatId, message, userId);
      }

      return {
        event: 'message:sent',
        data: message,
      };
    } catch (error: any) {
      console.error('Error sending message:', error);
      return {
        event: 'error',
        data: { message: error.message },
      };
    }
  }

  @SubscribeMessage('typing:start')
  async handleTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string },
  ) {
    const userId = client.userId;
    if (!userId) return;

    // Add user to typing set for this chat
    if (!this.typingUsers.has(data.chatId)) {
      this.typingUsers.set(data.chatId, new Set());
    }
    this.typingUsers.get(data.chatId)?.add(userId);

    // Get user info
    const user = await this.usersService.getUserById(userId);

    // Broadcast typing indicator to others in chat
    client.to(`chat:${data.chatId}`).emit('typing:start', {
      chatId: data.chatId,
      userId,
      userName: user?.name,
    });
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string },
  ) {
    const userId = client.userId;
    if (!userId) return;

    // Remove user from typing set
    this.typingUsers.get(data.chatId)?.delete(userId);

    // Broadcast stop typing to others in chat
    client.to(`chat:${data.chatId}`).emit('typing:stop', {
      chatId: data.chatId,
      userId,
    });
  }

  @SubscribeMessage('message:edit')
  async handleMessageEdit(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: string; content: string; chatId: string },
  ) {
    try {
      const userId = client.userId;
      if (!userId) {
        return { event: 'error', data: { message: 'Unauthorized' } };
      }

      // Update message through service
      const result = await this.messagesService.updateMessage(
        data.messageId,
        userId,
        data.content,
      );

      if (!result.success) {
        return { event: 'error', data: { message: result.message } };
      }

      // Broadcast updated message to chat room
      this.server
        .to(`chat:${data.chatId}`)
        .emit('message:updated', result.data);

      return {
        event: 'message:edited',
        data: result.data,
      };
    } catch (error: any) {
      console.error('Error editing message:', error);
      return {
        event: 'error',
        data: { message: error.message },
      };
    }
  }

  @SubscribeMessage('message:react')
  async handleMessageReaction(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: string; emoji: string; chatId: string },
  ) {
    try {
      const userId = client.userId;
      if (!userId) {
        return { event: 'error', data: { message: 'Unauthorized' } };
      }

      // Toggle reaction through service
      const result = await this.messagesService.toggleReaction(
        data.messageId,
        userId,
        data.emoji,
      );

      if (!result.success) {
        return { event: 'error', data: { message: result.message } };
      }

      // Broadcast reaction update to chat room
      this.server.to(`chat:${data.chatId}`).emit('message:reaction', {
        messageId: data.messageId,
        reactions: result.data?.reactions || [],
      });

      return {
        event: 'message:reacted',
        data: result.data,
      };
    } catch (error: any) {
      console.error('Error reacting to message:', error);
      return {
        event: 'error',
        data: { message: error.message },
      };
    }
  }

  private async handleAIMention(chatId: string, message: any, userId: string) {
    try {
      // Show AI is typing
      this.server.to(`chat:${chatId}`).emit('typing:start', {
        chatId,
        userId: 'ai',
        userName: 'AI Assistant',
      });

      // Stream AI response with rate limiting
      for await (const chunk of this.aiService.streamAIMention(
        chatId,
        message,
        userId,
      )) {
        if (chunk.type === 'start') {
          // Emit stream start event with rate limit info
          this.server.to(`chat:${chatId}`).emit('ai:stream:start', {
            chatId,
            rateLimit: chunk.rateLimit,
          });
        } else if (chunk.type === 'chunk') {
          // Emit each chunk
          this.server.to(`chat:${chatId}`).emit('ai:stream:chunk', {
            chatId,
            content: chunk.content,
          });
        } else if (chunk.type === 'end') {
          // Stream complete - broadcast final message
          this.server.to(`chat:${chatId}`).emit('ai:stream:end', {
            chatId,
            message: chunk.data,
          });
          // Also emit regular message:new for consistency
          this.server.to(`chat:${chatId}`).emit('message:new', chunk.data);
        } else if (chunk.type === 'error') {
          this.server.to(`chat:${chatId}`).emit('ai:stream:error', {
            chatId,
            error: chunk.content,
            rateLimit: chunk.rateLimit,
          });
        }
      }

      // Stop AI typing
      this.server.to(`chat:${chatId}`).emit('typing:stop', {
        chatId,
        userId: 'ai',
      });
    } catch (error) {
      console.error('Error handling AI mention:', error);
      this.server.to(`chat:${chatId}`).emit('typing:stop', {
        chatId,
        userId: 'ai',
      });
      this.server.to(`chat:${chatId}`).emit('ai:stream:error', {
        chatId,
        error: 'An error occurred while processing your request.',
      });
    }
  }

  // Public method to notify users of new chat
  notifyNewChat(participants: string[], chatData: any) {
    participants.forEach((userId) => {
      const socketIds = this.userSockets.get(userId);
      if (socketIds) {
        socketIds.forEach((socketId) => {
          this.server.to(socketId).emit('chat:new', chatData);
        });
      }
    });
  }

  // Public method to notify users of chat updates
  notifyChatUpdate(participants: string[], chatData: any) {
    participants.forEach((userId) => {
      const socketIds = this.userSockets.get(userId);
      if (socketIds) {
        socketIds.forEach((socketId) => {
          this.server.to(socketId).emit('chat:updated', chatData);
        });
      }
    });
  }

  // Public method to broadcast a message to a chat room
  broadcastMessage(chatId: string, message: any) {
    console.log(`Broadcasting message to chat:${chatId}`, message._id);
    this.server.to(`chat:${chatId}`).emit('message:new', message);
  }

  // Private method to notify mentioned users
  private async notifyMentionedUsers(message: any, senderId: string) {
    try {
      // Get chat to access participants
      const chat = await this.chatService.getChatByIdInternal(
        message.chatId.toString(),
      );

      if (!chat) {
        console.log('Chat not found for mentions notification');
        return;
      }

      // Get all users in the chat
      const participantIds = chat.participants.map((p) => p.toString());
      const chatParticipants =
        await this.usersService.getUsersByIds(participantIds);

      // Find mentioned users by username
      for (const mentionedUsername of message.mentions) {
        const mentionedUser = chatParticipants.find(
          (user) =>
            user.name.toLowerCase() === mentionedUsername ||
            user.email.toLowerCase().split('@')[0] === mentionedUsername,
        );

        if (mentionedUser && mentionedUser._id.toString() !== senderId) {
          // Get socket IDs for the mentioned user
          const socketIds = this.userSockets.get(mentionedUser._id.toString());

          if (socketIds && socketIds.length > 0) {
            // Send mention notification to each socket
            socketIds.forEach((socketId) => {
              this.server.to(socketId).emit('user:mentioned', {
                messageId: message._id,
                chatId: message.chatId,
                senderId: senderId,
                senderName: message.senderId?.name || 'Someone',
                content: message.content,
                mentionedUsername: mentionedUsername,
              });
            });

            console.log(
              `Notified user ${mentionedUser.name} about mention in message ${message._id}`,
            );
          }
        }
      }
    } catch (error) {
      console.error('Error notifying mentioned users:', error);
    }
  }

  /**
   * Notify all participants when a new chat is created
   */
  notifyChatCreated(chat: any) {
    try {
      // Emit to all participants so they see the new chat in their list
      chat.participants.forEach((participant: any) => {
        const participantId =
          typeof participant === 'string'
            ? participant
            : participant._id.toString();
        const socketIds = this.userSockets.get(participantId);

        if (socketIds) {
          socketIds.forEach((socketId) => {
            this.server.to(socketId).emit('chat:created', chat);
          });
          console.log(
            `Notified user ${participantId} about new chat ${chat._id}`,
          );
        }
      });
    } catch (error) {
      console.error('Error notifying chat created:', error);
    }
  }
}
