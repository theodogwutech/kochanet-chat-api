"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchema = void 0;
const mongoose_1 = require("mongoose");
const user_interface_1 = require("../interfaces/user.interface");
exports.UserSchema = new mongoose_1.Schema({
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
        enum: Object.values(user_interface_1.AuthProvider),
        default: user_interface_1.AuthProvider.LOCAL,
    },
    googleId: { type: String, index: true },
    avatar: { type: String },
    status: {
        type: String,
        enum: Object.values(user_interface_1.UserStatus),
        default: user_interface_1.UserStatus.OFFLINE,
    },
    isEmailVerified: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isDeletedAt: { type: Date },
    emailVerifiedAt: { type: Date },
    lastSeen: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
exports.UserSchema.index({ isActive: 1 });
//# sourceMappingURL=user.model.js.map