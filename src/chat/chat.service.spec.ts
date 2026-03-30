import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatRepository } from '../repositories/chat.repository';
import { Types } from 'mongoose';
import { ChatType } from '../interfaces/chat.interface';

describe('ChatService', () => {
  let service: ChatService;
  let chatRepository: jest.Mocked<ChatRepository>;

  const mockUser1Id = new Types.ObjectId();
  const mockUser2Id = new Types.ObjectId();

  const mockChat = {
    _id: new Types.ObjectId(),
    name: 'Test Chat',
    type: ChatType.GROUP,
    participants: [mockUser1Id, mockUser2Id],
    createdBy: mockUser1Id,
    isPrivate: false,
    isActive: true,
    tags: [],
    lastActivity: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockChatRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByIdWithParticipants: jest.fn(),
      findUserChats: jest.fn(),
      findDirectChat: jest.fn(),
      isParticipant: jest.fn(),
      addParticipants: jest.fn(),
      removeParticipant: jest.fn(),
      update: jest.fn(),
      updateLastActivity: jest.fn(),
      updateLastMessage: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: ChatRepository,
          useValue: mockChatRepo,
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    chatRepository = module.get(ChatRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createChat', () => {
    it('should create a group chat successfully', async () => {
      const createChatDto = {
        name: 'Test Group',
        type: ChatType.GROUP,
        participants: [mockUser2Id.toString()],
        isPrivate: false,
      };

      chatRepository.create.mockResolvedValue(mockChat as any);
      chatRepository.findByIdWithParticipants.mockResolvedValue(mockChat as any);

      const result = await service.createChat({
        userId: mockUser1Id.toString(),
        createChatDto,
      });

      expect(result.success).toBe(true);
      expect(result.code).toBe(HttpStatus.CREATED);
      expect(result.data).toEqual(mockChat);
      expect(chatRepository.create).toHaveBeenCalled();
    });

    it('should fail if direct chat has more than 2 participants', async () => {
      const createChatDto = {
        name: 'Direct Chat',
        type: ChatType.DIRECT,
        participants: [
          mockUser2Id.toString(),
          new Types.ObjectId().toString(),
        ],
        isPrivate: false,
      };

      const result = await service.createChat({
        userId: mockUser1Id.toString(),
        createChatDto,
      });

      expect(result.success).toBe(false);
      expect(result.code).toBe(HttpStatus.BAD_REQUEST);
      expect(result.message).toBe(
        'Direct chats must have exactly 2 participants',
      );
    });

    it('should return existing direct chat if one exists', async () => {
      const createChatDto = {
        name: 'Direct Chat',
        type: ChatType.DIRECT,
        participants: [mockUser2Id.toString()],
        isPrivate: false,
      };

      const existingChat = {
        ...mockChat,
        type: ChatType.DIRECT,
      };

      chatRepository.findDirectChat.mockResolvedValue(existingChat as any);

      const result = await service.createChat({
        userId: mockUser1Id.toString(),
        createChatDto,
      });

      expect(result.success).toBe(true);
      expect(result.code).toBe(HttpStatus.OK);
      expect(result.message).toBe('Direct chat already exists');
      expect(result.data).toEqual(existingChat);
    });
  });

  describe('getUserChats', () => {
    it('should retrieve user chats successfully', async () => {
      const chats = [mockChat];
      chatRepository.findUserChats.mockResolvedValue(chats as any);

      const result = await service.getUserChats({
        userId: mockUser1Id.toString(),
      });

      expect(result.success).toBe(true);
      expect(result.code).toBe(HttpStatus.OK);
      expect(result.data).toEqual(chats);
      expect(chatRepository.findUserChats).toHaveBeenCalledWith(
        mockUser1Id.toString(),
      );
    });
  });

  describe('getChatById', () => {
    it('should retrieve chat by ID successfully', async () => {
      chatRepository.findById.mockResolvedValue(mockChat as any);
      chatRepository.isParticipant.mockResolvedValue(true);
      chatRepository.findByIdWithParticipants.mockResolvedValue(mockChat as any);

      const result = await service.getChatById({
        chatId: mockChat._id.toString(),
        userId: mockUser1Id.toString(),
      });

      expect(result.success).toBe(true);
      expect(result.code).toBe(HttpStatus.OK);
      expect(result.data).toEqual(mockChat);
    });

    it('should fail if chat not found', async () => {
      chatRepository.findById.mockResolvedValue(null);

      const result = await service.getChatById({
        chatId: 'nonexistent',
        userId: mockUser1Id.toString(),
      });

      expect(result.success).toBe(false);
      expect(result.code).toBe(HttpStatus.NOT_FOUND);
      expect(result.message).toBe('Chat not found');
    });

    it('should fail if user is not a participant', async () => {
      const nonParticipantId = new Types.ObjectId().toString();

      chatRepository.findById.mockResolvedValue(mockChat as any);
      chatRepository.isParticipant.mockResolvedValue(false);

      const result = await service.getChatById({
        chatId: mockChat._id.toString(),
        userId: nonParticipantId,
      });

      expect(result.success).toBe(false);
      expect(result.code).toBe(HttpStatus.FORBIDDEN);
      expect(result.message).toBe('You are not a participant of this chat');
    });
  });

  describe('updateTags', () => {
    it('should update chat tags successfully', async () => {
      const tags = ['important', 'work', 'project'];
      const updatedChat = {
        ...mockChat,
        tags,
      };

      chatRepository.findById.mockResolvedValue(mockChat as any);
      chatRepository.isParticipant.mockResolvedValue(true);
      chatRepository.update.mockResolvedValue(updatedChat as any);

      const result = await service.updateTags({
        chatId: mockChat._id.toString(),
        userId: mockUser1Id.toString(),
        tags,
      });

      expect(result.success).toBe(true);
      expect(result.code).toBe(HttpStatus.OK);
      expect(result.data.tags).toEqual(tags);
      expect(chatRepository.update).toHaveBeenCalledWith(
        mockChat._id.toString(),
        { tags },
      );
    });

    it('should sanitize tags (lowercase, trim, dedupe)', async () => {
      const inputTags = ['  Work  ', 'IMPORTANT', 'work', 'Project'];
      const expectedTags = ['work', 'important', 'project'];

      chatRepository.findById.mockResolvedValue(mockChat as any);
      chatRepository.isParticipant.mockResolvedValue(true);
      chatRepository.update.mockResolvedValue({
        ...mockChat,
        tags: expectedTags,
      } as any);

      const result = await service.updateTags({
        chatId: mockChat._id.toString(),
        userId: mockUser1Id.toString(),
        tags: inputTags,
      });

      expect(result.success).toBe(true);
      expect(chatRepository.update).toHaveBeenCalledWith(
        mockChat._id.toString(),
        { tags: expectedTags },
      );
    });

    it('should fail if chat not found', async () => {
      chatRepository.findById.mockResolvedValue(null);

      const result = await service.updateTags({
        chatId: 'nonexistent',
        userId: mockUser1Id.toString(),
        tags: ['test'],
      });

      expect(result.success).toBe(false);
      expect(result.code).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('leaveChat', () => {
    it('should allow user to leave chat', async () => {
      chatRepository.findById.mockResolvedValue(mockChat as any);
      chatRepository.isParticipant.mockResolvedValue(true);
      chatRepository.removeParticipant.mockResolvedValue(undefined);
      chatRepository.findById.mockResolvedValueOnce(mockChat as any);
      chatRepository.findById.mockResolvedValueOnce({
        ...mockChat,
        participants: [mockUser2Id],
      } as any);

      const result = await service.leaveChat({
        chatId: mockChat._id.toString(),
        userId: mockUser1Id.toString(),
      });

      expect(result.success).toBe(true);
      expect(result.code).toBe(HttpStatus.OK);
      expect(chatRepository.removeParticipant).toHaveBeenCalled();
    });

    it('should deactivate chat if last participant leaves', async () => {
      const singleParticipantChat = {
        ...mockChat,
        participants: [mockUser1Id],
      };

      chatRepository.findById.mockResolvedValueOnce(
        singleParticipantChat as any,
      );
      chatRepository.isParticipant.mockResolvedValue(true);
      chatRepository.removeParticipant.mockResolvedValue(undefined);
      chatRepository.findById.mockResolvedValueOnce({
        ...singleParticipantChat,
        participants: [],
      } as any);
      chatRepository.update.mockResolvedValue(undefined);

      const result = await service.leaveChat({
        chatId: mockChat._id.toString(),
        userId: mockUser1Id.toString(),
      });

      expect(result.success).toBe(true);
      expect(chatRepository.update).toHaveBeenCalledWith(
        mockChat._id.toString(),
        { isActive: false },
      );
    });
  });
});
