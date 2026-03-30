import { Schema } from 'mongoose';
import { AuthProvider, UserStatus } from '../interfaces/user.interface';
export declare const UserSchema: Schema<any, import("mongoose").Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    email: string;
    name: string;
    authProvider: AuthProvider;
    status: UserStatus;
    lastSeen: NativeDate;
    isEmailVerified: boolean;
    isDeleted: boolean;
    isActive: boolean;
    password?: string | null | undefined;
    googleId?: string | null | undefined;
    avatar?: string | null | undefined;
    emailVerifiedAt?: NativeDate | null | undefined;
    isDeletedAt?: NativeDate | null | undefined;
} & import("mongoose").DefaultTimestampProps, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<{
    email: string;
    name: string;
    authProvider: AuthProvider;
    status: UserStatus;
    lastSeen: NativeDate;
    isEmailVerified: boolean;
    isDeleted: boolean;
    isActive: boolean;
    password?: string | null | undefined;
    googleId?: string | null | undefined;
    avatar?: string | null | undefined;
    emailVerifiedAt?: NativeDate | null | undefined;
    isDeletedAt?: NativeDate | null | undefined;
} & import("mongoose").DefaultTimestampProps>, {}, import("mongoose").MergeType<import("mongoose").DefaultSchemaOptions, {
    timestamps: true;
}>> & import("mongoose").FlatRecord<{
    email: string;
    name: string;
    authProvider: AuthProvider;
    status: UserStatus;
    lastSeen: NativeDate;
    isEmailVerified: boolean;
    isDeleted: boolean;
    isActive: boolean;
    password?: string | null | undefined;
    googleId?: string | null | undefined;
    avatar?: string | null | undefined;
    emailVerifiedAt?: NativeDate | null | undefined;
    isDeletedAt?: NativeDate | null | undefined;
} & import("mongoose").DefaultTimestampProps> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
