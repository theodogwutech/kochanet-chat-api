import { Response } from 'express';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { ResponseUtil } from '../common/utils/response.util';
import { IUserDocument } from 'src/interfaces/user.interface';
export declare class MessagesController {
    private readonly messagesService;
    private readonly utils;
    constructor(messagesService: MessagesService, utils: ResponseUtil);
    createMessage(user: IUserDocument, createMessageDto: CreateMessageDto, res: Response): Promise<void>;
    getMessages(res: Response, user: IUserDocument, chatId: string, limit?: number, skip?: number): Promise<void>;
    markAsRead(messageId: string, user: IUserDocument, res: Response): Promise<void>;
}
