import mongoose from 'mongoose';
import { ChatType } from '../interfaces/chat.interface';
export declare const ChatSchema: mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    type: ChatType;
    name: string;
    isActive: boolean;
    participants: mongoose.Types.ObjectId[];
    createdBy: mongoose.Types.ObjectId;
    isPrivate: boolean;
    lastActivity: NativeDate;
    lastMessage?: mongoose.Types.ObjectId | null | undefined;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    type: ChatType;
    name: string;
    isActive: boolean;
    participants: mongoose.Types.ObjectId[];
    createdBy: mongoose.Types.ObjectId;
    isPrivate: boolean;
    lastActivity: NativeDate;
    lastMessage?: mongoose.Types.ObjectId | null | undefined;
} & mongoose.DefaultTimestampProps>, {}, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
    timestamps: true;
}>> & mongoose.FlatRecord<{
    type: ChatType;
    name: string;
    isActive: boolean;
    participants: mongoose.Types.ObjectId[];
    createdBy: mongoose.Types.ObjectId;
    isPrivate: boolean;
    lastActivity: NativeDate;
    lastMessage?: mongoose.Types.ObjectId | null | undefined;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
