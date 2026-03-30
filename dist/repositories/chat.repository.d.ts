import { Model, Types, FilterQuery } from 'mongoose';
import { IChatDocument } from 'src/interfaces/chat.interface';
export declare class ChatRepository {
    private readonly chatModel;
    constructor(chatModel: Model<IChatDocument>);
    create(chatData: Partial<IChatDocument>): Promise<IChatDocument>;
    findOne(query: FilterQuery<IChatDocument>): Promise<IChatDocument | null>;
    findById(id: string): Promise<IChatDocument | null>;
    findByIdWithParticipants(id: string): Promise<IChatDocument | null>;
    findDirectChat(user1Id: string, user2Id: string): Promise<IChatDocument | null>;
    findUserChats(userId: string): Promise<IChatDocument[]>;
    update(id: string, data: Partial<IChatDocument>): Promise<IChatDocument | null>;
    updateLastActivity(id: string): Promise<void>;
    updateLastMessage(id: string, messageId: string): Promise<void>;
    addParticipants(id: string, participantIds: Types.ObjectId[]): Promise<IChatDocument | null>;
    removeParticipant(id: string, userId: string): Promise<IChatDocument | null>;
    isParticipant(chatId: string, userId: string): Promise<boolean>;
}
