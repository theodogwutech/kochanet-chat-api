"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatSchema = void 0;
const mongoose_1 = require("mongoose");
const chat_interface_1 = require("../interfaces/chat.interface");
exports.ChatSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    type: {
        type: String,
        enum: Object.values(chat_interface_1.ChatType),
        default: chat_interface_1.ChatType.GROUP,
    },
    participants: [
        { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    ],
    createdBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    isPrivate: { type: Boolean, default: false },
    lastMessage: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Message' },
    lastActivity: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
exports.ChatSchema.index({ participants: 1 });
exports.ChatSchema.index({ createdBy: 1 });
exports.ChatSchema.index({ lastActivity: -1 });
//# sourceMappingURL=chat.model.js.map