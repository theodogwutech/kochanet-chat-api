import { IsNotEmpty, IsString } from 'class-validator';

export class TextToSpeechDto {
  @IsNotEmpty()
  @IsString()
  text: string;

  @IsNotEmpty()
  @IsString()
  chatId: string;
}
