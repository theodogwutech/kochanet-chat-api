"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const chat_controller_1 = require("./chat.controller");
const chat_service_1 = require("./chat.service");
const chat_model_1 = require("../models/chat.model");
const chat_repository_1 = require("../repositories/chat.repository");
const response_util_1 = require("../common/utils/response.util");
const auth_middleware_1 = require("../common/middleware/auth.middleware");
const auth_module_1 = require("../auth/auth.module");
const users_module_1 = require("../users/users.module");
let ChatModule = class ChatModule {
    configure(consumer) {
        consumer.apply(auth_middleware_1.AuthenticationMiddleware).forRoutes(chat_controller_1.ChatController);
    }
};
exports.ChatModule = ChatModule;
exports.ChatModule = ChatModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: 'Chat', schema: chat_model_1.ChatSchema }]),
            (0, common_1.forwardRef)(() => auth_module_1.AuthModule),
            (0, common_1.forwardRef)(() => users_module_1.UsersModule),
        ],
        controllers: [chat_controller_1.ChatController],
        providers: [chat_service_1.ChatService, chat_repository_1.ChatRepository, response_util_1.ResponseUtil, auth_middleware_1.AuthenticationMiddleware],
        exports: [chat_service_1.ChatService],
    })
], ChatModule);
//# sourceMappingURL=chat.module.js.map