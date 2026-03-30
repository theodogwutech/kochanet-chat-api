import { Document } from 'mongoose';
export declare enum AuthProvider {
    LOCAL = "local",
    GOOGLE = "google"
}
export declare enum UserStatus {
    ONLINE = "online",
    OFFLINE = "offline",
    AWAY = "away"
}
export interface IUser {
    email: string;
    name: string;
    password?: string;
    authProvider: AuthProvider;
    googleId?: string;
    avatar?: string;
    status: UserStatus;
    lastSeen: Date;
    isEmailVerified: boolean;
    emailVerifiedAt?: Date;
    isDeleted: boolean;
    isDeletedAt?: Date;
    isActive: boolean;
}
export interface IUserDocument extends Document, IUser {
}
