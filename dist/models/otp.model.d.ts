import mongoose from 'mongoose';
export declare const OtpSchema: mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    otp: string;
    userId: mongoose.Types.ObjectId;
    expiresAt: NativeDate;
    isUsed: boolean;
    attempts: number;
    purpose: string;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    otp: string;
    userId: mongoose.Types.ObjectId;
    expiresAt: NativeDate;
    isUsed: boolean;
    attempts: number;
    purpose: string;
} & mongoose.DefaultTimestampProps>, {}, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
    timestamps: true;
}>> & mongoose.FlatRecord<{
    otp: string;
    userId: mongoose.Types.ObjectId;
    expiresAt: NativeDate;
    isUsed: boolean;
    attempts: number;
    purpose: string;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
