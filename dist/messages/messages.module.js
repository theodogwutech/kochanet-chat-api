"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const messages_controller_1 = require("./messages.controller");
const messages_service_1 = require("./messages.service");
const message_model_1 = require("../models/message.model");
const chat_module_1 = require("../chat/chat.module");
const message_repository_1 = require("../repositories/message.repository");
const response_util_1 = require("../common/utils/response.util");
const auth_middleware_1 = require("../common/middleware/auth.middleware");
const auth_module_1 = require("../auth/auth.module");
const users_module_1 = require("../users/users.module");
let MessagesModule = class MessagesModule {
    configure(consumer) {
        consumer.apply(auth_middleware_1.AuthenticationMiddleware).forRoutes(messages_controller_1.MessagesController);
    }
};
exports.MessagesModule = MessagesModule;
exports.MessagesModule = MessagesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: 'Message', schema: message_model_1.MessageSchema }]),
            chat_module_1.ChatModule,
            (0, common_1.forwardRef)(() => auth_module_1.AuthModule),
            (0, common_1.forwardRef)(() => users_module_1.UsersModule),
        ],
        controllers: [messages_controller_1.MessagesController],
        providers: [messages_service_1.MessagesService, message_repository_1.MessageRepository, response_util_1.ResponseUtil, auth_middleware_1.AuthenticationMiddleware],
        exports: [messages_service_1.MessagesService],
    })
], MessagesModule);
//# sourceMappingURL=messages.module.js.map