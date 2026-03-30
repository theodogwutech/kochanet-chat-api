"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let MessageRepository = class MessageRepository {
    messageModel;
    constructor(messageModel) {
        this.messageModel = messageModel;
    }
    async create(messageData) {
        const message = new this.messageModel(messageData);
        await message.save();
        const populatedMessage = await this.messageModel
            .findById(message._id)
            .populate('senderId', '-password')
            .exec();
        return populatedMessage || message;
    }
    async findById(id) {
        return await this.messageModel.findById(id).exec();
    }
    async findByChatId(chatId, limit = 50, skip = 0) {
        return await this.messageModel
            .find({
            chatId: new mongoose_2.Types.ObjectId(chatId),
            isDeleted: false,
        })
            .populate('senderId', '-password')
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip)
            .exec();
    }
    async getRecentMessages(chatId, limit = 20) {
        return await this.messageModel
            .find({
            chatId: new mongoose_2.Types.ObjectId(chatId),
            isDeleted: false,
        })
            .populate('senderId', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit)
            .exec();
    }
    async findByMention(chatId, mention, limit = 20) {
        return await this.messageModel
            .find({
            chatId: new mongoose_2.Types.ObjectId(chatId),
            mentions: mention,
            isDeleted: false,
        })
            .populate('senderId', '-password')
            .sort({ createdAt: -1 })
            .limit(limit)
            .exec();
    }
    async markAsRead(messageId, userId) {
        return await this.messageModel
            .findByIdAndUpdate(messageId, { $addToSet: { readBy: new mongoose_2.Types.ObjectId(userId) } }, { new: true })
            .exec();
    }
    async update(id, data) {
        return await this.messageModel
            .findByIdAndUpdate(id, data, { new: true })
            .exec();
    }
    async softDelete(id) {
        return await this.messageModel
            .findByIdAndUpdate(id, { isDeleted: true }, { new: true })
            .exec();
    }
    async countByChatId(chatId) {
        return await this.messageModel
            .countDocuments({
            chatId: new mongoose_2.Types.ObjectId(chatId),
            isDeleted: false,
        })
            .exec();
    }
};
exports.MessageRepository = MessageRepository;
exports.MessageRepository = MessageRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Message')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], MessageRepository);
//# sourceMappingURL=message.repository.js.map