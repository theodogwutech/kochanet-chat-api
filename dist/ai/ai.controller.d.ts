import { Response } from 'express';
import { AIService } from './ai.service';
import { IUserDocument } from '../interfaces/user.interface';
import { ResponseUtil } from '../common/utils/response.util';
import { TranscribeAudioDto } from './dto/transcribe-audio.dto';
import { TextToSpeechDto } from './dto/text-to-speech.dto';
import { ChatGateway } from '../gateways/chat.gateway';
export declare class AIController {
    private readonly aiService;
    private readonly utils;
    private readonly chatGateway;
    constructor(aiService: AIService, utils: ResponseUtil, chatGateway: ChatGateway);
    transcribeAudio(user: IUserDocument, transcribeAudioDto: TranscribeAudioDto, res: Response): Promise<void>;
    textToSpeech(user: IUserDocument, textToSpeechDto: TextToSpeechDto, res: Response): Promise<void>;
}
