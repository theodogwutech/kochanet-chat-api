import { Document, Types } from 'mongoose';
export interface IOtp {
    userId: Types.ObjectId;
    otp: string;
    expiresAt: Date;
    isUsed: boolean;
    attempts: number;
    purpose: string;
    createdAt: Date;
}
export interface IOtpDocument extends Document, IOtp {
}
