import { Model } from 'mongoose';
import { IMessageDocument } from 'src/interfaces/message.interface';
export declare class MessageRepository {
    private readonly messageModel;
    constructor(messageModel: Model<IMessageDocument>);
    create(messageData: Partial<IMessageDocument>): Promise<IMessageDocument>;
    findById(id: string): Promise<IMessageDocument | null>;
    findByChatId(chatId: string, limit?: number, skip?: number): Promise<IMessageDocument[]>;
    getRecentMessages(chatId: string, limit?: number): Promise<IMessageDocument[]>;
    findByMention(chatId: string, mention: string, limit?: number): Promise<IMessageDocument[]>;
    markAsRead(messageId: string, userId: string): Promise<IMessageDocument | null>;
    update(id: string, data: Partial<IMessageDocument>): Promise<IMessageDocument | null>;
    softDelete(id: string): Promise<IMessageDocument | null>;
    countByChatId(chatId: string): Promise<number>;
}
