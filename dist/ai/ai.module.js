"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIModule = void 0;
const common_1 = require("@nestjs/common");
const ai_controller_1 = require("./ai.controller");
const ai_service_1 = require("./ai.service");
const messages_module_1 = require("../messages/messages.module");
const auth_middleware_1 = require("../common/middleware/auth.middleware");
const auth_module_1 = require("../auth/auth.module");
const users_module_1 = require("../users/users.module");
const response_util_1 = require("../common/utils/response.util");
const gateway_module_1 = require("../gateways/gateway.module");
let AIModule = class AIModule {
    configure(consumer) {
        consumer.apply(auth_middleware_1.AuthenticationMiddleware).forRoutes(ai_controller_1.AIController);
    }
};
exports.AIModule = AIModule;
exports.AIModule = AIModule = __decorate([
    (0, common_1.Module)({
        imports: [
            messages_module_1.MessagesModule,
            (0, common_1.forwardRef)(() => auth_module_1.AuthModule),
            (0, common_1.forwardRef)(() => users_module_1.UsersModule),
            (0, common_1.forwardRef)(() => gateway_module_1.GatewayModule),
        ],
        controllers: [ai_controller_1.AIController],
        providers: [ai_service_1.AIService, auth_middleware_1.AuthenticationMiddleware, response_util_1.ResponseUtil],
        exports: [ai_service_1.AIService],
    })
], AIModule);
//# sourceMappingURL=ai.module.js.map