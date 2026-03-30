import { CreateMessageDto } from '../dto/create-message.dto';
export interface CreateMessageParams {
    userId: string;
    createMessageDto: CreateMessageDto;
}
export interface GetMessagesParams {
    chatId: string;
    userId: string;
    limit?: number;
    skip?: number;
}
export interface MarkAsReadParams {
    messageId: string;
    userId: string;
}
