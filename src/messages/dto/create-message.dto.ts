import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MessageType } from 'src/interfaces/message.interface';

export class CreateMessageDto {
  @ApiProperty({ example: 'chat_id_here' })
  @IsString()
  @IsNotEmpty()
  chatId!: string;

  @ApiProperty({ example: 'Hello, how are you?' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({ example: 'text', enum: MessageType })
  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType;

  @ApiProperty({ example: 'audio_url', required: false })
  @IsString()
  @IsOptional()
  audioUrl?: string;
}
