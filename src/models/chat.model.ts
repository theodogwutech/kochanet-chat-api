import mongoose, { Schema } from 'mongoose';
import { ChatType } from '../interfaces/chat.interface';

export const ChatSchema = new Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: Object.values(ChatType),
      default: ChatType.GROUP,
    },

    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    isPrivate: { type: Boolean, default: false },
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    lastActivity: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    tags: [{ type: String, trim: true, lowercase: true }],
  },
  { timestamps: true },
);

ChatSchema.index({ participants: 1 });
ChatSchema.index({ createdBy: 1 });
ChatSchema.index({ lastActivity: -1 });
