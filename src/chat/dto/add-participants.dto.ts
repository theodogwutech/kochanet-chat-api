import { IsArray, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddParticipantsDto {
  @ApiProperty({ example: ['user1_id', 'user2_id'] })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  participants: string[];
}
