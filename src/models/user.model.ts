import { Schema } from 'mongoose';
import { AuthProvider, UserStatus } from '../interfaces/user.interface';

export const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: { type: String, required: true },
    password: { type: String },
    authProvider: {
      type: String,
      enum: Object.values(AuthProvider),
      default: AuthProvider.LOCAL,
    },
    googleId: { type: String, index: true },
    avatar: { type: String },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.OFFLINE,
    },
    isEmailVerified: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isDeletedAt: { type: Date },
    emailVerifiedAt: { type: Date },
    lastSeen: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Indexes for faster queries (email and googleId already indexed inline)
UserSchema.index({ isActive: 1 });
