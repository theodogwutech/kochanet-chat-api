import { Response } from 'express';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { AddParticipantsDto } from './dto/add-participants.dto';
import { ResponseUtil } from '../common/utils/response.util';
import { IUserDocument } from 'src/interfaces/user.interface';
export declare class ChatController {
    private readonly chatService;
    private readonly utils;
    constructor(chatService: ChatService, utils: ResponseUtil);
    createChat(user: IUserDocument, createChatDto: CreateChatDto, res: Response): Promise<void>;
    getUserChats(user: IUserDocument, res: Response): Promise<void>;
    getChatById(chatId: string, user: IUserDocument, res: Response): Promise<void>;
    addParticipants(chatId: string, user: IUserDocument, addParticipantsDto: AddParticipantsDto, res: Response): Promise<void>;
    leaveChat(chatId: string, user: IUserDocument, res: Response): Promise<void>;
}
