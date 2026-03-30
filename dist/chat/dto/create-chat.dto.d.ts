import { ChatType } from 'src/interfaces/chat.interface';
export declare class CreateChatDto {
    name: string;
    type?: ChatType;
    participants: string[];
    isPrivate?: boolean;
}
