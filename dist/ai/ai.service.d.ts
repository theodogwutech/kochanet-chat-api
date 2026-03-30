import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessagesService } from '../messages/messages.service';
import { IMessageDocument } from 'src/interfaces/message.interface';
import { TranscribeAudioParams, TextToSpeechParams } from './interfaces/ai-service.interface';
export declare class AIService {
    private configService;
    private messagesService;
    private openai;
    private readonly aiName;
    private readonly model;
    private readonly maxContextMessages;
    constructor(configService: ConfigService, messagesService: MessagesService);
    processAIMention(chatId: string, mentionMessage: IMessageDocument): Promise<any>;
    transcribeAudio(audioBuffer: Buffer): Promise<string>;
    generateSpeech(text: string): Promise<Buffer>;
    private buildContext;
    private getAIResponse;
    checkForAIMention(content: string): boolean;
    transcribeAudioForChat(params: TranscribeAudioParams): Promise<{
        success: boolean;
        code: HttpStatus;
        message: string;
        data: {
            text: string;
            message: IMessageDocument | undefined;
        };
    } | {
        success: boolean;
        code: HttpStatus;
        message: string;
        data?: undefined;
    }>;
    generateSpeechForChat(params: TextToSpeechParams): Promise<{
        success: boolean;
        code: HttpStatus;
        message: string;
        data: {
            audioUrl: string;
            text: string;
        };
    } | {
        success: boolean;
        code: HttpStatus;
        message: string;
        data?: undefined;
    }>;
}
