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
exports.ChatRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const chat_interface_1 = require("../interfaces/chat.interface");
let ChatRepository = class ChatRepository {
    chatModel;
    constructor(chatModel) {
        this.chatModel = chatModel;
    }
    async create(chatData) {
        const chat = new this.chatModel(chatData);
        return await chat.save();
    }
    async findOne(query) {
        return await this.chatModel.findOne(query).exec();
    }
    async findById(id) {
        return await this.chatModel.findById(id).exec();
    }
    async findByIdWithParticipants(id) {
        return await this.chatModel
            .findById(id)
            .populate('participants', '-password')
            .exec();
    }
    async findDirectChat(user1Id, user2Id) {
        const userIds = [new mongoose_2.Types.ObjectId(user1Id), new mongoose_2.Types.ObjectId(user2Id)];
        return await this.chatModel
            .findOne({
            type: chat_interface_1.ChatType.DIRECT,
            participants: { $all: userIds, $size: 2 },
        })
            .exec();
    }
    async findUserChats(userId) {
        return await this.chatModel
            .find({
            participants: new mongoose_2.Types.ObjectId(userId),
            isActive: true,
        })
            .populate('participants', '-password')
            .populate('lastMessage')
            .sort({ lastActivity: -1 })
            .exec();
    }
    async update(id, data) {
        return await this.chatModel
            .findByIdAndUpdate(id, data, { new: true })
            .exec();
    }
    async updateLastActivity(id) {
        await this.chatModel
            .findByIdAndUpdate(id, { lastActivity: new Date() })
            .exec();
    }
    async updateLastMessage(id, messageId) {
        await this.chatModel
            .findByIdAndUpdate(id, {
            lastMessage: new mongoose_2.Types.ObjectId(messageId),
            lastActivity: new Date(),
        })
            .exec();
    }
    async addParticipants(id, participantIds) {
        return await this.chatModel
            .findByIdAndUpdate(id, { $addToSet: { participants: { $each: participantIds } } }, { new: true })
            .populate('participants', '-password')
            .exec();
    }
    async removeParticipant(id, userId) {
        return await this.chatModel
            .findByIdAndUpdate(id, { $pull: { participants: new mongoose_2.Types.ObjectId(userId) } }, { new: true })
            .exec();
    }
    async isParticipant(chatId, userId) {
        const chat = await this.chatModel
            .findOne({
            _id: new mongoose_2.Types.ObjectId(chatId),
            participants: new mongoose_2.Types.ObjectId(userId),
        })
            .exec();
        return !!chat;
    }
};
exports.ChatRepository = ChatRepository;
exports.ChatRepository = ChatRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Chat')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ChatRepository);
//# sourceMappingURL=chat.repository.js.map