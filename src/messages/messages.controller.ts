import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  UseGuards,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ResponseUtil } from '../common/utils/response.util';
import { IUserDocument } from 'src/interfaces/user.interface';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly utils: ResponseUtil,
  ) {}

  @Post()
  async createMessage(
    @CurrentUser() user: IUserDocument,
    @Body() createMessageDto: CreateMessageDto,
    @Res() res: Response,
  ) {
    const result = await this.messagesService.createMessage({
      userId: user._id.toString(),
      createMessageDto,
    });

    this.utils.apiResponse({
      res,
      success: result.success,
      code: result.code,
      message: result.message,
      data: result.data,
    });
  }

  @Get('chat/:chatId')
  async getMessages(
    @Res() res: Response,
    @CurrentUser() user: IUserDocument,
    @Param('chatId') chatId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('skip', new ParseIntPipe({ optional: true })) skip?: number,
  ) {
    const result = await this.messagesService.getMessages({
      chatId,
      userId: user._id.toString(),
      limit,
      skip,
    });

    this.utils.apiResponse({
      res,
      success: result.success,
      code: result.code,
      message: result.message,
      data: result.data,
    });
  }

  @Patch(':id/read')
  async markAsRead(
    @Param('id') messageId: string,
    @CurrentUser() user: IUserDocument,
    @Res() res: Response,
  ) {
    const result = await this.messagesService.markAsRead({
      messageId,
      userId: user._id.toString(),
    });

    this.utils.apiResponse({
      res,
      success: result.success,
      code: result.code,
      message: result.message,
    });
  }
}
