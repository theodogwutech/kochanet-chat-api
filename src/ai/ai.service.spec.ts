import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AiService } from './ai.service';
import { MessagesService } from '../messages/messages.service';
import { Types } from 'mongoose';
import { MessageType } from '../interfaces/message.interface';

describe('AiService', () => {
  let service: AiService;
  let messagesService: jest.Mocked<MessagesService>;
  let configService: jest.Mocked<ConfigService>;

  const mockMessage = {
    _id: new Types.ObjectId(),
    chatId: new Types.ObjectId(),
    senderId: new Types.ObjectId(),
    content: '@ai What is the weather today?',
    type: MessageType.TEXT,
    isAI: false,
    mentions: ['ai'],
    reactions: [],
    readBy: [],
    isEdited: false,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockMessagesService = {
      getMessagesWithMention: jest.fn(),
      getRecentMessages: jest.fn(),
      createAIMessage: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn((key: string) => {
        const config = {
          OPENAI_API_KEY: 'test-key',
          AI_MODEL: 'gpt-4o-mini',
          AI_ASSISTANT_NAME: 'AI',
          AI_MAX_CONTEXT_MESSAGES: '20',
          AI_MAX_CONTEXT_TOKENS: '2000',
          AI_RATE_LIMIT: '10',
          AI_RATE_LIMIT_WINDOW: '5',
        };
        return config[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: MessagesService,
          useValue: mockMessagesService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    messagesService = module.get(MessagesService);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', async () => {
      const userId = 'test-user-id';
      const chatId = 'test-chat-id';

      messagesService.getMessagesWithMention.mockResolvedValue([]);
      messagesService.getRecentMessages.mockResolvedValue([mockMessage] as any);

      // First request should be allowed
      const generator = service.streamAIMention(
        chatId,
        mockMessage as any,
        userId,
      );

      let firstChunk = await generator.next();
      expect(firstChunk.value).toHaveProperty('type', 'start');
      expect(firstChunk.value).toHaveProperty('rateLimit');
      expect(firstChunk.value.rateLimit.allowed).toBe(true);
      expect(firstChunk.value.rateLimit.remaining).toBe(9);
    });

    it('should enforce rate limit after exceeding', async () => {
      const userId = 'test-user-rate-limit';
      const chatId = 'test-chat-id';

      messagesService.getMessagesWithMention.mockResolvedValue([]);
      messagesService.getRecentMessages.mockResolvedValue([mockMessage] as any);

      // Make 10 requests (the limit)
      for (let i = 0; i < 10; i++) {
        const generator = service.streamAIMention(
          chatId,
          mockMessage as any,
          userId,
        );
        await generator.next();
        // Close the generator
        await generator.return(undefined);
      }

      // 11th request should be rate limited
      const generator = service.streamAIMention(
        chatId,
        mockMessage as any,
        userId,
      );

      const result = await generator.next();
      expect(result.value).toHaveProperty('type', 'error');
      expect(result.value.content).toContain('Rate limit exceeded');
      expect(result.value.rateLimit.allowed).toBe(false);
    });
  });

  describe('Context Management', () => {
    it('should retrieve mention history for context', async () => {
      const chatId = 'test-chat-id';
      const mentionHistory = [
        { ...mockMessage, content: 'Previous @ai question' },
        { ...mockMessage, content: 'Another @ai question' },
      ];

      messagesService.getMessagesWithMention.mockResolvedValue(
        mentionHistory as any,
      );
      messagesService.getRecentMessages.mockResolvedValue([mockMessage] as any);

      const generator = service.streamAIMention(chatId, mockMessage as any);
      await generator.next();

      expect(messagesService.getMessagesWithMention).toHaveBeenCalledWith(
        chatId,
        'ai',
        expect.any(Number),
      );
    });

    it('should retrieve recent messages for context', async () => {
      const chatId = 'test-chat-id';

      messagesService.getMessagesWithMention.mockResolvedValue([]);
      messagesService.getRecentMessages.mockResolvedValue([mockMessage] as any);

      const generator = service.streamAIMention(chatId, mockMessage as any);
      await generator.next();

      expect(messagesService.getRecentMessages).toHaveBeenCalledWith(
        chatId,
        expect.any(Number),
      );
    });
  });

  describe('Token Estimation', () => {
    it('should estimate tokens for a message', () => {
      const text = 'This is a test message with some words';
      const estimatedTokens = (service as any).estimateTokens(text);

      // Basic token estimation: roughly 4 characters per token
      expect(estimatedTokens).toBeGreaterThan(0);
      expect(estimatedTokens).toBeLessThan(text.length);
    });
  });

  describe('Mention Extraction', () => {
    it('should extract mentions from text', () => {
      const text = '@ai what is the weather? Also @user1 should know';
      const mentions = (service as any).extractMentions(text);

      expect(mentions).toContain('ai');
      expect(mentions).toContain('user1');
      expect(mentions.length).toBe(2);
    });

    it('should handle text without mentions', () => {
      const text = 'This is a regular message without any mentions';
      const mentions = (service as any).extractMentions(text);

      expect(mentions).toEqual([]);
    });

    it('should remove duplicate mentions', () => {
      const text = '@ai hello @ai what is @ai doing';
      const mentions = (service as any).extractMentions(text);

      expect(mentions).toEqual(['ai']);
      expect(mentions.length).toBe(1);
    });
  });

  describe('Context Building', () => {
    it('should filter messages within token limit', () => {
      const messages = [
        {
          ...mockMessage,
          content: 'First message with some content',
          createdAt: new Date('2024-01-01'),
        },
        {
          ...mockMessage,
          content: 'Second message with more content',
          createdAt: new Date('2024-01-02'),
        },
        {
          ...mockMessage,
          content: 'Third message with even more content to test filtering',
          createdAt: new Date('2024-01-03'),
        },
      ];

      const maxTokens = 20;
      const filtered = (service as any).filterMessagesByTokenLimit(
        messages,
        maxTokens,
      );

      // Should filter out older messages to stay within token limit
      expect(filtered.length).toBeLessThanOrEqual(messages.length);

      // Should keep most recent messages
      if (filtered.length > 0) {
        expect(filtered[filtered.length - 1].createdAt).toEqual(
          messages[messages.length - 1].createdAt,
        );
      }
    });
  });

  describe('AI Response Creation', () => {
    it('should create AI message after response', async () => {
      const chatId = 'test-chat-id';
      const aiResponse = 'This is an AI response';

      messagesService.createAIMessage.mockResolvedValue({
        ...mockMessage,
        content: aiResponse,
        isAI: true,
      } as any);

      await service.createAIMessage(chatId, aiResponse);

      expect(messagesService.createAIMessage).toHaveBeenCalledWith(
        chatId,
        aiResponse,
        undefined,
      );
    });

    it('should create AI message with audio URL', async () => {
      const chatId = 'test-chat-id';
      const aiResponse = 'This is an AI response';
      const audioUrl = 'https://example.com/audio.mp3';

      messagesService.createAIMessage.mockResolvedValue({
        ...mockMessage,
        content: aiResponse,
        isAI: true,
        audioUrl,
        type: MessageType.VOICE,
      } as any);

      await service.createAIMessage(chatId, aiResponse, audioUrl);

      expect(messagesService.createAIMessage).toHaveBeenCalledWith(
        chatId,
        aiResponse,
        audioUrl,
      );
    });
  });
});
