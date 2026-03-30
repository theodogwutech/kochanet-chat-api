import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Res,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Response } from 'express';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { AddParticipantsDto } from './dto/add-participants.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ResponseUtil } from '../common/utils/response.util';
import { IUserDocument } from 'src/interfaces/user.interface';
import { ChatGateway } from '../gateways/chat.gateway';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly utils: ResponseUtil,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
  ) {}

  @Post()
  async createChat(
    @CurrentUser() user: IUserDocument,
    @Body() createChatDto: CreateChatDto,
    @Res() res: Response,
  ) {
    const result = await this.chatService.createChat({
      userId: user._id.toString(),
      createChatDto,
    });

    // Emit WebSocket event to all participants to update their chat lists
    if (result.success && result.data) {
      this.chatGateway.notifyChatCreated(result.data);
    }

    this.utils.apiResponse({
      res,
      success: result.success,
      code: result.code,
      message: result.message,
      data: result.data,
    });
  }

  @Get()
  async getUserChats(@CurrentUser() user: IUserDocument, @Res() res: Response) {
    const result = await this.chatService.getUserChats({
      userId: user._id.toString(),
    });

    this.utils.apiResponse({
      res,
      success: result.success,
      code: result.code,
      message: result.message,
      data: result.data,
    });
  }

  @Get(':id')
  async getChatById(
    @Param('id') chatId: string,
    @CurrentUser() user: IUserDocument,
    @Res() res: Response,
  ) {
    const result = await this.chatService.getChatById({
      chatId,
      userId: user._id.toString(),
    });

    this.utils.apiResponse({
      res,
      success: result.success,
      code: result.code,
      message: result.message,
      data: result.data,
    });
  }

  @Patch(':id/participants')
  async addParticipants(
    @Param('id') chatId: string,
    @CurrentUser() user: IUserDocument,
    @Body() addParticipantsDto: AddParticipantsDto,
    @Res() res: Response,
  ) {
    const result = await this.chatService.addParticipants({
      chatId,
      userId: user._id.toString(),
      addParticipantsDto,
    });

    this.utils.apiResponse({
      res,
      success: result.success,
      code: result.code,
      message: result.message,
      data: result.data,
    });
  }

  @Patch(':id/tags')
  async updateTags(
    @Param('id') chatId: string,
    @CurrentUser() user: IUserDocument,
    @Body() body: { tags: string[] },
    @Res() res: Response,
  ) {
    const result = await this.chatService.updateTags({
      chatId,
      userId: user._id.toString(),
      tags: body.tags,
    });

    this.utils.apiResponse({
      res,
      success: result.success,
      code: result.code,
      message: result.message,
      data: result.data,
    });
  }

  @Delete(':id/leave')
  async leaveChat(
    @Param('id') chatId: string,
    @CurrentUser() user: IUserDocument,
    @Res() res: Response,
  ) {
    const result = await this.chatService.leaveChat({
      chatId,
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
