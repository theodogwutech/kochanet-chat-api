import { MessageType } from 'src/interfaces/message.interface';
export declare class CreateMessageDto {
    chatId: string;
    content: string;
    type?: MessageType;
    audioUrl?: string;
}
