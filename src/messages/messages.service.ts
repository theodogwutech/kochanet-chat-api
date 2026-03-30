import { Injectable, HttpStatus, Inject } from '@nestjs/common';
import { Types } from 'mongoose';
import { ChatService } from '../chat/chat.service';
import { MessageRepository } from '../repositories/message.repository';
import {
  CreateMessageParams,
  GetMessagesParams,
  MarkAsReadParams,
} from './interfaces/message-service.interface';
import { MessageType } from 'src/interfaces/message.interface';

@Injectable()
export class MessagesService {
  constructor(
    @Inject(MessageRepository) private messageRepository: MessageRepository,
    private chatService: ChatService,
  ) {}

  async createMessage(params: CreateMessageParams) {
    try {
      const { userId, createMessageDto } = params;
      const { chatId, content, type, audioUrl } = createMessageDto;

      // Verify chat exists and user is a participant
      const chat = await this.chatService.getChatByIdInternal(chatId);
      if (!chat) {
        return {
          success: false,
          code: HttpStatus.NOT_FOUND,
          message: 'Chat not found',
        };
      }

      const isParticipant = chat.participants.some(
        (p) => p.toString() === userId,
      );

      if (!isParticipant) {
        return {
          success: false,
          code: HttpStatus.FORBIDDEN,
          message: 'You are not a participant of this chat',
        };
      }

      // Extract mentions from content
      const mentions = this.extractMentions(content);

      // Create message
      const message = await this.messageRepository.create({
        chatId: new Types.ObjectId(chatId),
        senderId: new Types.ObjectId(userId),
        content,
        type: type || MessageType.TEXT,
        audioUrl,
        mentions,
        isAI: false,
      });

      // Update chat's last message and activity
      await this.chatService.updateLastMessage(chatId, message._id.toString());

      return {
        success: true,
        code: HttpStatus.CREATED,
        message: 'Message sent successfully',
        data: message,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Failed to create message: ${errorMessage}`,
      };
    }
  }

  async getMessages(params: GetMessagesParams) {
    try {
      const { chatId, userId, limit = 50, skip = 0 } = params;

      // Verify chat exists and user is a participant
      const chat = await this.chatService.getChatByIdInternal(chatId);
      if (!chat) {
        return {
          success: false,
          code: HttpStatus.NOT_FOUND,
          message: 'Chat not found',
        };
      }

      const isParticipant = chat.participants.some(
        (p) => p.toString() === userId,
      );

      if (!isParticipant) {
        return {
          success: false,
          code: HttpStatus.FORBIDDEN,
          message: 'You are not a participant of this chat',
        };
      }

      // Get messages
      const messages = await this.messageRepository.findByChatId(
        chatId,
        limit,
        skip,
      );

      return {
        success: true,
        code: HttpStatus.OK,
        message: 'Messages retrieved successfully',
        data: messages.reverse(), // Reverse to show oldest first
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Failed to retrieve messages: ${errorMessage}`,
      };
    }
  }

  async createAIMessage(chatId: string, content: string, audioUrl?: string) {
    const message = await this.messageRepository.create({
      chatId: new Types.ObjectId(chatId),
      senderId: new Types.ObjectId('000000000000000000000000'), // System/AI user ID
      content,
      type: audioUrl ? MessageType.VOICE : MessageType.TEXT,
      audioUrl,
      isAI: true,
      mentions: [],
    });

    await this.chatService.updateLastMessage(chatId, message._id.toString());

    return message;
  }

  async markAsRead(params: MarkAsReadParams) {
    try {
      const { messageId, userId } = params;

      const message = await this.messageRepository.findById(messageId);

      if (!message) {
        return {
          success: false,
          code: HttpStatus.NOT_FOUND,
          message: 'Message not found',
        };
      }

      // Add user to readBy using repository method
      await this.messageRepository.markAsRead(messageId, userId);

      return {
        success: true,
        code: HttpStatus.OK,
        message: 'Message marked as read',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Failed to mark message as read: ${errorMessage}`,
      };
    }
  }

  async getMessagesWithMention(
    chatId: string,
    mention: string,
    limit: number = 20,
  ) {
    return await this.messageRepository.findByMention(chatId, mention, limit);
  }

  async getRecentMessages(chatId: string, limit: number = 20) {
    return await this.messageRepository.getRecentMessages(chatId, limit);
  }

  private extractMentions(content: string): string[] {
    // Extract @mentions from message content
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1].toLowerCase());
    }

    return [...new Set(mentions)]; // Remove duplicates
  }
}
