"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageSchema = void 0;
const mongoose_1 = require("mongoose");
const message_interface_1 = require("../interfaces/message.interface");
exports.MessageSchema = new mongoose_1.Schema({
    chatId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true,
        index: true,
    },
    senderId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    content: { type: String, required: true },
    type: {
        type: String,
        enum: Object.values(message_interface_1.MessageType),
        default: message_interface_1.MessageType.TEXT,
    },
    isAI: { type: Boolean, default: false },
    mentions: [{ type: String, index: true }],
    audioUrl: { type: String },
    voiceTranscription: { type: String },
    readBy: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' }],
    isEdited: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
exports.MessageSchema.index({ chatId: 1, createdAt: -1 });
exports.MessageSchema.index({ senderId: 1 });
exports.MessageSchema.index({ mentions: 1 });
//# sourceMappingURL=message.model.js.map