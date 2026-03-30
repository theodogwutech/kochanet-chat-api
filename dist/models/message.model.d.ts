import mongoose from 'mongoose';
import { MessageType } from '../interfaces/message.interface';
export declare const MessageSchema: mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    type: MessageType;
    isDeleted: boolean;
    chatId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    content: string;
    isAI: boolean;
    mentions: string[];
    readBy: mongoose.Types.ObjectId[];
    isEdited: boolean;
    audioUrl?: string | null | undefined;
    voiceTranscription?: string | null | undefined;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    type: MessageType;
    isDeleted: boolean;
    chatId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    content: string;
    isAI: boolean;
    mentions: string[];
    readBy: mongoose.Types.ObjectId[];
    isEdited: boolean;
    audioUrl?: string | null | undefined;
    voiceTranscription?: string | null | undefined;
} & mongoose.DefaultTimestampProps>, {}, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
    timestamps: true;
}>> & mongoose.FlatRecord<{
    type: MessageType;
    isDeleted: boolean;
    chatId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    content: string;
    isAI: boolean;
    mentions: string[];
    readBy: mongoose.Types.ObjectId[];
    isEdited: boolean;
    audioUrl?: string | null | undefined;
    voiceTranscription?: string | null | undefined;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
