import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessageRepository } from '../repositories/message.repository';
import { ChatService } from '../chat/chat.service';
import { Types } from 'mongoose';
import { MessageType } from '../interfaces/message.interface';

describe('MessagesService', () => {
  let service: MessagesService;
  let messageRepository: jest.Mocked<MessageRepository>;
  let chatService: jest.Mocked<ChatService>;

  const mockMessage = {
    _id: new Types.ObjectId(),
    chatId: new Types.ObjectId(),
    senderId: new Types.ObjectId(),
    content: 'Test message',
    type: MessageType.TEXT,
    isAI: false,
    mentions: [],
    reactions: [],
    readBy: [],
    isEdited: false,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockChat = {
    _id: new Types.ObjectId(),
    participants: [new Types.ObjectId(), new Types.ObjectId()],
    name: 'Test Chat',
    isActive: true,
  };

  beforeEach(async () => {
    const mockMessageRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByChatId: jest.fn(),
      update: jest.fn(),
      markAsRead: jest.fn(),
      searchMessages: jest.fn(),
      toggleReaction: jest.fn(),
    };

    const mockChatService = {
      getChatByIdInternal: jest.fn(),
      updateLastMessage: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        {
          provide: MessageRepository,
          useValue: mockMessageRepo,
        },
        {
          provide: ChatService,
          useValue: mockChatService,
        },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
    messageRepository = module.get(MessageRepository);
    chatService = module.get(ChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createMessage', () => {
    it('should create a message successfully', async () => {
      const userId = mockChat.participants[0].toString();
      const createMessageDto = {
        chatId: mockChat._id.toString(),
        content: 'Test message',
        type: MessageType.TEXT,
      };

      chatService.getChatByIdInternal.mockResolvedValue(mockChat as any);
      messageRepository.create.mockResolvedValue(mockMessage as any);
      chatService.updateLastMessage.mockResolvedValue(undefined);

      const result = await service.createMessage({
        userId,
        createMessageDto,
      });

      expect(result.success).toBe(true);
      expect(result.code).toBe(HttpStatus.CREATED);
      expect(result.data).toEqual(mockMessage);
      expect(chatService.getChatByIdInternal).toHaveBeenCalledWith(
        createMessageDto.chatId,
      );
      expect(messageRepository.create).toHaveBeenCalled();
    });

    it('should fail if chat not found', async () => {
      const userId = mockChat.participants[0].toString();
      const createMessageDto = {
        chatId: 'nonexistent',
        content: 'Test message',
        type: MessageType.TEXT,
      };

      chatService.getChatByIdInternal.mockResolvedValue(null);

      const result = await service.createMessage({
        userId,
        createMessageDto,
      });

      expect(result.success).toBe(false);
      expect(result.code).toBe(HttpStatus.NOT_FOUND);
      expect(result.message).toBe('Chat not found');
    });

    it('should fail if user is not a participant', async () => {
      const userId = new Types.ObjectId().toString();
      const createMessageDto = {
        chatId: mockChat._id.toString(),
        content: 'Test message',
        type: MessageType.TEXT,
      };

      chatService.getChatByIdInternal.mockResolvedValue(mockChat as any);

      const result = await service.createMessage({
        userId,
        createMessageDto,
      });

      expect(result.success).toBe(false);
      expect(result.code).toBe(HttpStatus.FORBIDDEN);
      expect(result.message).toBe('You are not a participant of this chat');
    });
  });

  describe('getMessages', () => {
    it('should retrieve messages successfully', async () => {
      const userId = mockChat.participants[0].toString();
      const chatId = mockChat._id.toString();

      chatService.getChatByIdInternal.mockResolvedValue(mockChat as any);
      messageRepository.findByChatId.mockResolvedValue([mockMessage] as any);

      const result = await service.getMessages({
        chatId,
        userId,
        limit: 50,
        skip: 0,
      });

      expect(result.success).toBe(true);
      expect(result.code).toBe(HttpStatus.OK);
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('updateMessage', () => {
    it('should update message successfully', async () => {
      const messageId = mockMessage._id.toString();
      const userId = mockMessage.senderId.toString();
      const newContent = 'Updated message';

      messageRepository.findById.mockResolvedValue(mockMessage as any);
      messageRepository.update.mockResolvedValue({
        ...mockMessage,
        content: newContent,
        isEdited: true,
      } as any);

      const result = await service.updateMessage(messageId, userId, newContent);

      expect(result.success).toBe(true);
      expect(result.code).toBe(HttpStatus.OK);
      expect(messageRepository.update).toHaveBeenCalled();
    });

    it('should fail if message not found', async () => {
      messageRepository.findById.mockResolvedValue(null);

      const result = await service.updateMessage('nonexistent', 'userid', 'new');

      expect(result.success).toBe(false);
      expect(result.code).toBe(HttpStatus.NOT_FOUND);
    });

    it('should fail if user is not the sender', async () => {
      const differentUserId = new Types.ObjectId().toString();

      messageRepository.findById.mockResolvedValue(mockMessage as any);

      const result = await service.updateMessage(
        mockMessage._id.toString(),
        differentUserId,
        'new content',
      );

      expect(result.success).toBe(false);
      expect(result.code).toBe(HttpStatus.FORBIDDEN);
      expect(result.message).toBe('You can only edit your own messages');
    });
  });

  describe('searchMessages', () => {
    it('should search messages successfully', async () => {
      const userId = mockChat.participants[0].toString();
      const chatId = mockChat._id.toString();
      const query = 'test';

      chatService.getChatByIdInternal.mockResolvedValue(mockChat as any);
      messageRepository.searchMessages.mockResolvedValue([mockMessage] as any);

      const result = await service.searchMessages(chatId, userId, query);

      expect(result.success).toBe(true);
      expect(result.code).toBe(HttpStatus.OK);
      expect(messageRepository.searchMessages).toHaveBeenCalledWith(
        chatId,
        query,
      );
    });
  });

  describe('markAsRead', () => {
    it('should mark message as read successfully', async () => {
      const messageId = mockMessage._id.toString();
      const userId = new Types.ObjectId().toString();

      messageRepository.findById.mockResolvedValue(mockMessage as any);
      messageRepository.markAsRead.mockResolvedValue(mockMessage as any);

      const result = await service.markAsRead({ messageId, userId });

      expect(result.success).toBe(true);
      expect(result.code).toBe(HttpStatus.OK);
      expect(messageRepository.markAsRead).toHaveBeenCalledWith(
        messageId,
        userId,
      );
    });
  });
});
