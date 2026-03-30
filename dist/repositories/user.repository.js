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
exports.UserRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let UserRepository = class UserRepository {
    userModel;
    constructor(userModel) {
        this.userModel = userModel;
    }
    async create(userData) {
        const [user] = await this.userModel.create([userData]);
        return user;
    }
    async findOne(query) {
        return await this.userModel.findOne(query).exec();
    }
    async findAll(query) {
        return await this.userModel.find(query).exec();
    }
    async findById(id) {
        return await this.userModel.findById(id).select('-password').exec();
    }
    async findByEmail(email) {
        return await this.userModel
            .findOne({
            email: email.toLowerCase().trim(),
        })
            .exec();
    }
    async findByGoogleId(googleId) {
        return await this.userModel.findOne({ googleId }).exec();
    }
    async update(id, data) {
        return await this.userModel
            .findByIdAndUpdate(id, data, { new: true })
            .select('-password')
            .exec();
    }
    async updateStatus(id, status) {
        return await this.userModel
            .findByIdAndUpdate(id, { status, lastSeen: new Date() }, { new: true })
            .select('-password')
            .exec();
    }
    async search(query, currentUserId, limit = 10) {
        return await this.userModel
            .find({
            _id: { $ne: currentUserId },
            isActive: true,
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } },
            ],
        })
            .select('-password')
            .limit(limit)
            .exec();
    }
    async getAllExceptCurrent(currentUserId) {
        return await this.userModel
            .find({ _id: { $ne: currentUserId }, isActive: true })
            .select('-password')
            .sort({ name: 1 })
            .exec();
    }
    async findByIds(userIds) {
        return await this.userModel
            .find({ _id: { $in: userIds } })
            .select('-password')
            .exec();
    }
    async exists(query) {
        const count = await this.userModel.countDocuments(query).exec();
        return count > 0;
    }
};
exports.UserRepository = UserRepository;
exports.UserRepository = UserRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('User')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UserRepository);
//# sourceMappingURL=user.repository.js.map