import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsBoolean,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ChatType } from 'src/interfaces/chat.interface';

export class CreateChatDto {
  @ApiProperty({ example: 'Project Discussion' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'group', enum: ChatType })
  @IsEnum(ChatType)
  @IsOptional()
  type?: ChatType;

  @ApiProperty({ example: ['user1_id', 'user2_id'] })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  participants!: string[];

  @ApiProperty({ example: false })
  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;
}
