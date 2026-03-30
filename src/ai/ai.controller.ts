import { Controller, Post, Body, Res, UseGuards, Inject, forwardRef } from '@nestjs/common';
import { Response } from 'express';
import { AIService } from './ai.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { IUserDocument } from '../interfaces/user.interface';
import { ResponseUtil } from '../common/utils/response.util';
import { TranscribeAudioDto } from './dto/transcribe-audio.dto';
import { TextToSpeechDto } from './dto/text-to-speech.dto';
import { ChatGateway } from '../gateways/chat.gateway';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
  constructor(
    private readonly aiService: AIService,
    private readonly utils: ResponseUtil,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
  ) {}

  @Post('transcribe')
  async transcribeAudio(
    @CurrentUser() user: IUserDocument,
    @Body() transcribeAudioDto: TranscribeAudioDto,
    @Res() res: Response,
  ) {
    try {
      console.log('Transcription request received for user:', user._id);
      const result = await this.aiService.transcribeAudioForChat({
        userId: user._id.toString(),
        transcribeAudioDto,
      });

      console.log('Transcription result:', result.success, result.message);

      // Broadcast the transcribed message to the chat room via WebSocket
      if (result.success && result.data?.message) {
        console.log('Broadcasting transcribed message to chat room');
        this.chatGateway.broadcastMessage(
          transcribeAudioDto.chatId,
          result.data.message,
        );
      }

      this.utils.apiResponse({
        res,
        success: result.success,
        code: result.code,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.error('Error in transcribe endpoint:', error);
      this.utils.apiResponse({
        res,
        success: false,
        code: 500,
        message: 'Internal server error during transcription',
        data: null,
      });
    }
  }

  @Post('text-to-speech')
  async textToSpeech(
    @CurrentUser() user: IUserDocument,
    @Body() textToSpeechDto: TextToSpeechDto,
    @Res() res: Response,
  ) {
    const result = await this.aiService.generateSpeechForChat({
      userId: user._id.toString(),
      textToSpeechDto,
    });

    this.utils.apiResponse({
      res,
      success: result.success,
      code: result.code,
      message: result.message,
      data: result.data,
    });
  }
}
