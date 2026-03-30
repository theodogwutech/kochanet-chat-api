import { Injectable, HttpStatus, Inject } from '@nestjs/common';
import { Types } from 'mongoose';
import { ChatRepository } from '../repositories/chat.repository';
import {
  CreateChatParams,
  GetUserChatsParams,
  GetChatByIdParams,
  AddParticipantsParams,
  LeaveChatParams,
} from './interfaces/chat-service.interface';
import { ChatType, IChatDocument } from 'src/interfaces/chat.interface';

@Injectable()
export class ChatService {
  constructor(@Inject(ChatRepository) private chatRepository: ChatRepository) {}

  async createChat(params: CreateChatParams) {
    try {
      const { userId, createChatDto } = params;
      const { name, type, participants, isPrivate } = createChatDto;

      // Add creator to participants if not already included
      const participantIds = [...new Set([userId, ...participants])].map(
        (id) => new Types.ObjectId(id),
      );

      // For direct chats, ensure only 2 participants
      if (
        (type as ChatType) === ChatType.DIRECT &&
        participantIds.length !== 2
      ) {
        return {
          success: false,
          code: HttpStatus.BAD_REQUEST,
          message: 'Direct chats must have exactly 2 participants',
        };
      }

      // Check if direct chat already exists between these users
      if ((type as ChatType) === ChatType.DIRECT) {
        const existingChat = await this.chatRepository.findDirectChat(
          participantIds[0].toString(),
          participantIds[1].toString(),
        );

        if (existingChat) {
          return {
            success: true,
            code: HttpStatus.OK,
            message: 'Direct chat already exists',
            data: existingChat,
          };
        }
      }

      const chat = await this.chatRepository.create({
        name,
        type: type || ChatType.DIRECT,
        participants: participantIds,
        createdBy: new Types.ObjectId(userId),
        isPrivate: isPrivate || false,
        lastActivity: new Date(),
      });

      const populatedChat = await this.chatRepository.findByIdWithParticipants(
        chat._id.toString(),
      );

      return {
        success: true,
        code: HttpStatus.CREATED,
        message: 'Chat created successfully',
        data: populatedChat,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Failed to create chat: ${errorMessage}`,
      };
    }
  }

  async getUserChats(params: GetUserChatsParams) {
    try {
      const { userId } = params;

      const chats = await this.chatRepository.findUserChats(userId);

      return {
        success: true,
        code: HttpStatus.OK,
        message: 'Chats retrieved successfully',
        data: chats,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Failed to retrieve chats: ${errorMessage}`,
      };
    }
  }

  async getChatById(params: GetChatByIdParams) {
    try {
      const { chatId, userId } = params;

      const chat = await this.chatRepository.findByIdWithParticipants(chatId);

      if (!chat) {
        return {
          success: false,
          code: HttpStatus.NOT_FOUND,
          message: 'Chat not found',
        };
      }

      // Check if user is a participant
      const isParticipant = await this.chatRepository.isParticipant(
        chatId,
        userId,
      );

      if (!isParticipant) {
        return {
          success: false,
          code: HttpStatus.FORBIDDEN,
          message: 'You are not a participant of this chat',
        };
      }

      return {
        success: true,
        code: HttpStatus.OK,
        message: 'Chat retrieved successfully',
        data: chat,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Failed to retrieve chat: ${errorMessage}`,
      };
    }
  }

  async addParticipants(params: AddParticipantsParams) {
    try {
      const { chatId, userId, addParticipantsDto } = params;

      const chat = await this.chatRepository.findById(chatId);

      if (!chat) {
        return {
          success: false,
          code: HttpStatus.NOT_FOUND,
          message: 'Chat not found',
        };
      }

      // Check if user is a participant
      const isParticipant = await this.chatRepository.isParticipant(
        chatId,
        userId,
      );

      if (!isParticipant) {
        return {
          success: false,
          code: HttpStatus.FORBIDDEN,
          message: 'You are not a participant of this chat',
        };
      }

      // Cannot add participants to direct chats
      if (chat.type === ChatType.DIRECT) {
        return {
          success: false,
          code: HttpStatus.BAD_REQUEST,
          message: 'Cannot add participants to direct chats',
        };
      }

      // Add new participants
      const newParticipantIds = addParticipantsDto.participants.map(
        (id) => new Types.ObjectId(id),
      );

      const updatedChat = await this.chatRepository.addParticipants(
        chatId,
        newParticipantIds,
      );

      if (!updatedChat) {
        return {
          success: false,
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to add participants',
        };
      }

      return {
        success: true,
        code: HttpStatus.OK,
        message: 'Participants added successfully',
        data: updatedChat,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Failed to add participants: ${errorMessage}`,
      };
    }
  }

  async leaveChat(params: LeaveChatParams) {
    try {
      const { chatId, userId } = params;

      const chat = await this.chatRepository.findById(chatId);

      if (!chat) {
        return {
          success: false,
          code: HttpStatus.NOT_FOUND,
          message: 'Chat not found',
        };
      }

      // Check if user is a participant
      const isParticipant = await this.chatRepository.isParticipant(
        chatId,
        userId,
      );

      if (!isParticipant) {
        return {
          success: false,
          code: HttpStatus.FORBIDDEN,
          message: 'You are not a participant of this chat',
        };
      }

      // Remove user from participants
      await this.chatRepository.removeParticipant(chatId, userId);

      // Get updated chat to check participant count
      const updatedChat = await this.chatRepository.findById(chatId);
      if (updatedChat && updatedChat.participants.length === 0) {
        await this.chatRepository.update(chatId, { isActive: false });
      }

      return {
        success: true,
        code: HttpStatus.OK,
        message: 'Left chat successfully',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Failed to leave chat: ${errorMessage}`,
      };
    }
  }

  async updateTags(params: {
    chatId: string;
    userId: string;
    tags: string[];
  }) {
    try {
      const { chatId, userId, tags } = params;

      const chat = await this.chatRepository.findById(chatId);

      if (!chat) {
        return {
          success: false,
          code: HttpStatus.NOT_FOUND,
          message: 'Chat not found',
        };
      }

      // Check if user is a participant
      const isParticipant = await this.chatRepository.isParticipant(
        chatId,
        userId,
      );

      if (!isParticipant) {
        return {
          success: false,
          code: HttpStatus.FORBIDDEN,
          message: 'You are not a participant of this chat',
        };
      }

      // Sanitize tags: trim, lowercase, remove duplicates
      const sanitizedTags = [
        ...new Set(tags.map((tag) => tag.trim().toLowerCase())),
      ].filter((tag) => tag.length > 0);

      const updatedChat = await this.chatRepository.update(chatId, {
        tags: sanitizedTags,
      });

      return {
        success: true,
        code: HttpStatus.OK,
        message: 'Tags updated successfully',
        data: updatedChat,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Failed to update tags: ${errorMessage}`,
      };
    }
  }

  // Internal methods for use by other services
  async updateLastActivity(chatId: string) {
    await this.chatRepository.updateLastActivity(chatId);
  }

  async updateLastMessage(chatId: string, messageId: string) {
    await this.chatRepository.updateLastMessage(chatId, messageId);
  }

  async getChatByIdInternal(chatId: string): Promise<IChatDocument | null> {
    return await this.chatRepository.findById(chatId);
  }
}
