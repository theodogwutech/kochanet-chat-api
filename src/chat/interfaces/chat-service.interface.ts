import { CreateChatDto } from '../dto/create-chat.dto';
import { AddParticipantsDto } from '../dto/add-participants.dto';

export interface CreateChatParams {
  userId: string;
  createChatDto: CreateChatDto;
}

export interface GetUserChatsParams {
  userId: string;
}

export interface GetChatByIdParams {
  chatId: string;
  userId: string;
}

export interface AddParticipantsParams {
  chatId: string;
  userId: string;
  addParticipantsDto: AddParticipantsDto;
}

export interface LeaveChatParams {
  chatId: string;
  userId: string;
}
