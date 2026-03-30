import { Document, Types } from 'mongoose';
export declare enum MessageType {
    TEXT = "text",
    VOICE = "voice",
    AI = "ai"
}
export interface IMessage {
    chatId: Types.ObjectId;
    senderId: Types.ObjectId;
    content: string;
    type: MessageType;
    isAI: boolean;
    mentions: string[];
    audioUrl?: string;
    voiceTranscription?: string;
    readBy: Types.ObjectId[];
    isEdited: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface IMessageDocument extends Document, IMessage {
}
