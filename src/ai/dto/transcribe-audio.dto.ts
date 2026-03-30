import { IsNotEmpty, IsString } from 'class-validator';

export class TranscribeAudioDto {
  @IsNotEmpty()
  @IsString()
  chatId: string;

  @IsNotEmpty()
  @IsString()
  audioData: string; // Base64 encoded audio data
}
