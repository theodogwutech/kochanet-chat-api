import { Document, Types } from 'mongoose';
export declare enum ChatType {
    DIRECT = "direct",
    GROUP = "group"
}
export interface IChat {
    name: string;
    type: ChatType;
    participants: Types.ObjectId[];
    createdBy: Types.ObjectId;
    isPrivate: boolean;
    lastMessage?: Types.ObjectId;
    lastActivity: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface IChatDocument extends Document, IChat {
}
