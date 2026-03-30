import { Injectable, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { MessagesService } from '../messages/messages.service';
import {
  IMessageDocument,
  MessageType,
} from 'src/interfaces/message.interface';
import {
  TranscribeAudioParams,
  TextToSpeechParams,
} from './interfaces/ai-service.interface';

@Injectable()
export class AIService {
  private openai: OpenAI;
  private readonly aiName: string;
  private readonly model: string;
  private readonly maxContextMessages: number;

  constructor(
    private configService: ConfigService,
    private messagesService: MessagesService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
    this.aiName = this.configService.get<string>('AI_ASSISTANT_NAME') || 'AI';
    this.model =
      this.configService.get<string>('AI_MODEL') || 'gpt-4-turbo-preview';
    this.maxContextMessages = parseInt(
      this.configService.get<string>('AI_MAX_CONTEXT_MESSAGES') || '20',
    );
  }

  async processAIMention(
    chatId: string,
    mentionMessage: IMessageDocument,
  ): Promise<any> {
    try {
      // Get recent messages for context
      const recentMessages = await this.messagesService.getRecentMessages(
        chatId,
        this.maxContextMessages,
      );

      console.log('mentionMessage messages for context:', mentionMessage);

      // Build conversation context
      const context = this.buildContext(recentMessages);

      // Get AI response
      const aiResponse = await this.getAIResponse(context);

      // Save AI message to database
      const aiMessage = await this.messagesService.createAIMessage(
        chatId,
        aiResponse,
      );

      return {
        success: true,
        code: HttpStatus.OK,
        message: 'AI response generated successfully',
        data: aiMessage,
      };
    } catch (error) {
      console.error('Error processing AI mention:', error);

      // Send error message as AI response
      const errorMessage = await this.messagesService.createAIMessage(
        chatId,
        "I'm sorry, I encountered an error while processing your request. Please try again later.",
      );

      return {
        success: false,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to generate AI response',
        data: errorMessage,
      };
    }
  }

  async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    try {
      // Create a file-like object from buffer
      // OpenAI Whisper supports webm, mp3, mp4, mpeg, mpga, m4a, wav, and webm
      const uint8Array = new Uint8Array(audioBuffer);
      const blob = new Blob([uint8Array], { type: 'audio/webm' });
      const file = new File([blob], 'audio.webm', { type: 'audio/webm' });

      const transcription = await this.openai.audio.transcriptions.create({
        file: file,
        model: 'whisper-1',
      });

      return transcription.text;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  async generateSpeech(text: string): Promise<Buffer> {
    try {
      const response = await this.openai.audio.speech.create({
        model: 'tts-1',
        voice: 'alloy',
        input: text,
      });

      const buffer = Buffer.from(await response.arrayBuffer());
      return buffer;
    } catch (error) {
      console.error('Error generating speech:', error);
      throw new Error('Failed to generate speech');
    }
  }

  private buildContext(messages: IMessageDocument[]): string {
    // Reverse to get chronological order
    const sortedMessages = messages.reverse();

    const conversationContext = sortedMessages
      .map((msg: any) => {
        const sender = msg.isAI ? this.aiName : msg.senderId.name;
        return `${sender}: ${msg.content}`;
      })
      .join('\n');

    return conversationContext;
  }

  private async getAIResponse(context: string): Promise<string> {
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

    return (
      completion.choices[0]?.message?.content ||
      'I apologize, but I could not generate a response.'
    );
  }

  checkForAIMention(content: string): boolean {
    const aiMentionRegex = new RegExp(`@${this.aiName.toLowerCase()}\\b`, 'i');
    return aiMentionRegex.test(content.toLowerCase());
  }

  async transcribeAudioForChat(params: TranscribeAudioParams) {
    try {
      console.log('Starting audio transcription...');
      const { userId, transcribeAudioDto } = params;
      const { audioData, chatId } = transcribeAudioDto;

      console.log('ChatId:', chatId, 'UserId:', userId);
      console.log('Audio data length:', audioData?.length || 0);

      // Decode base64 audio data to buffer
      const audioBuffer = Buffer.from(audioData, 'base64');
      console.log('Audio buffer size:', audioBuffer.length, 'bytes');

      // Transcribe the audio
      console.log('Calling OpenAI Whisper API...');
      const transcribedText = await this.transcribeAudio(audioBuffer);
      console.log('Transcription completed:', transcribedText);

      // Save transcribed message to chat
      console.log('Saving transcribed message to chat...');
      const message = await this.messagesService.createMessage({
        userId,
        createMessageDto: {
          chatId,
          content: transcribedText,
          type: MessageType.TEXT,
        },
      });

      console.log('Message saved successfully');

      return {
        success: true,
        code: HttpStatus.OK,
        message: 'Audio transcribed successfully',
        data: {
          text: transcribedText,
          message: message.data,
        },
      };
    } catch (error) {
      console.error('Error in transcribeAudioForChat:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Failed to transcribe audio: ${errorMessage}`,
      };
    }
  }

  async generateSpeechForChat(params: TextToSpeechParams) {
    try {
      const { textToSpeechDto } = params;
      const { text, chatId } = textToSpeechDto;

      console.log('ChatId and text for TTS:', chatId, text);

      // Generate speech from text
      const audioBuffer = await this.generateSpeech(text);

      // Convert buffer to base64
      const audioBase64 = audioBuffer.toString('base64');

      // In a real implementation, you would upload this to cloud storage
      // and get a URL. For now, we'll return the base64 data
      const audioUrl = `data:audio/mp3;base64,${audioBase64}`;

      return {
        success: true,
        code: HttpStatus.OK,
        message: 'Speech generated successfully',
        data: {
          audioUrl,
          text,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Failed to generate speech: ${errorMessage}`,
      };
    }
  }
}
