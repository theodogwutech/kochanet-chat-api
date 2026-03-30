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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const openai_1 = require("openai");
const messages_service_1 = require("../messages/messages.service");
const message_interface_1 = require("../interfaces/message.interface");
let AIService = class AIService {
    configService;
    messagesService;
    openai;
    aiName;
    model;
    maxContextMessages;
    constructor(configService, messagesService) {
        this.configService = configService;
        this.messagesService = messagesService;
        this.openai = new openai_1.default({
            apiKey: this.configService.get('OPENAI_API_KEY'),
        });
        this.aiName = this.configService.get('AI_ASSISTANT_NAME') || 'AI';
        this.model =
            this.configService.get('AI_MODEL') || 'gpt-4-turbo-preview';
        this.maxContextMessages = parseInt(this.configService.get('AI_MAX_CONTEXT_MESSAGES') || '20');
    }
    async processAIMention(chatId, mentionMessage) {
        try {
            const recentMessages = await this.messagesService.getRecentMessages(chatId, this.maxContextMessages);
            console.log('mentionMessage messages for context:', mentionMessage);
            const context = this.buildContext(recentMessages);
            const aiResponse = await this.getAIResponse(context);
            const aiMessage = await this.messagesService.createAIMessage(chatId, aiResponse);
            return {
                success: true,
                code: common_1.HttpStatus.OK,
                message: 'AI response generated successfully',
                data: aiMessage,
            };
        }
        catch (error) {
            console.error('Error processing AI mention:', error);
            const errorMessage = await this.messagesService.createAIMessage(chatId, "I'm sorry, I encountered an error while processing your request. Please try again later.");
            return {
                success: false,
                code: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Failed to generate AI response',
                data: errorMessage,
            };
        }
    }
    async transcribeAudio(audioBuffer) {
        try {
            const uint8Array = new Uint8Array(audioBuffer);
            const blob = new Blob([uint8Array], { type: 'audio/webm' });
            const file = new File([blob], 'audio.webm', { type: 'audio/webm' });
            const transcription = await this.openai.audio.transcriptions.create({
                file: file,
                model: 'whisper-1',
            });
            return transcription.text;
        }
        catch (error) {
            console.error('Error transcribing audio:', error);
            throw new Error('Failed to transcribe audio');
        }
    }
    async generateSpeech(text) {
        try {
            const response = await this.openai.audio.speech.create({
                model: 'tts-1',
                voice: 'alloy',
                input: text,
            });
            const buffer = Buffer.from(await response.arrayBuffer());
            return buffer;
        }
        catch (error) {
            console.error('Error generating speech:', error);
            throw new Error('Failed to generate speech');
        }
    }
    buildContext(messages) {
        const sortedMessages = messages.reverse();
        const conversationContext = sortedMessages
            .map((msg) => {
            const sender = msg.isAI ? this.aiName : msg.senderId.name;
            return `${sender}: ${msg.content}`;
        })
            .join('\n');
        return conversationContext;
    }
    async getAIResponse(context) {
        const systemPrompt = `You are ${this.aiName}, a helpful AI assistant in a team workspace chat.
Your role is to provide accurate, concise, and helpful responses to questions and discussions.
You can see the conversation history and should provide contextual responses.
Be professional, friendly, and supportive. If you don't know something, admit it.`;
        const completion = await this.openai.chat.completions.create({
            model: this.model,
            messages: [
                { role: 'system', content: systemPrompt },
                {
                    role: 'user',
                    content: `Conversation history:\n${context}\n\nProvide a helpful response:`,
                },
            ],
            temperature: 0.7,
            max_tokens: 500,
        });
        return (completion.choices[0]?.message?.content ||
            'I apologize, but I could not generate a response.');
    }
    checkForAIMention(content) {
        const aiMentionRegex = new RegExp(`@${this.aiName.toLowerCase()}\\b`, 'i');
        return aiMentionRegex.test(content.toLowerCase());
    }
    async transcribeAudioForChat(params) {
        try {
            console.log('Starting audio transcription...');
            const { userId, transcribeAudioDto } = params;
            const { audioData, chatId } = transcribeAudioDto;
            console.log('ChatId:', chatId, 'UserId:', userId);
            console.log('Audio data length:', audioData?.length || 0);
            const audioBuffer = Buffer.from(audioData, 'base64');
            console.log('Audio buffer size:', audioBuffer.length, 'bytes');
            console.log('Calling OpenAI Whisper API...');
            const transcribedText = await this.transcribeAudio(audioBuffer);
            console.log('Transcription completed:', transcribedText);
            console.log('Saving transcribed message to chat...');
            const message = await this.messagesService.createMessage({
                userId,
                createMessageDto: {
                    chatId,
                    content: transcribedText,
                    type: message_interface_1.MessageType.TEXT,
                },
            });
            console.log('Message saved successfully');
            return {
                success: true,
                code: common_1.HttpStatus.OK,
                message: 'Audio transcribed successfully',
                data: {
                    text: transcribedText,
                    message: message.data,
                },
            };
        }
        catch (error) {
            console.error('Error in transcribeAudioForChat:', error);
            console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                code: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to transcribe audio: ${errorMessage}`,
            };
        }
    }
    async generateSpeechForChat(params) {
        try {
            const { textToSpeechDto } = params;
            const { text, chatId } = textToSpeechDto;
            console.log('ChatId and text for TTS:', chatId, text);
            const audioBuffer = await this.generateSpeech(text);
            const audioBase64 = audioBuffer.toString('base64');
            const audioUrl = `data:audio/mp3;base64,${audioBase64}`;
            return {
                success: true,
                code: common_1.HttpStatus.OK,
                message: 'Speech generated successfully',
                data: {
                    audioUrl,
                    text,
                },
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                code: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Failed to generate speech: ${errorMessage}`,
            };
        }
    }
};
exports.AIService = AIService;
exports.AIService = AIService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        messages_service_1.MessagesService])
], AIService);
//# sourceMappingURL=ai.service.js.map