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
exports.AIController = void 0;
const common_1 = require("@nestjs/common");
const ai_service_1 = require("./ai.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const response_util_1 = require("../common/utils/response.util");
const transcribe_audio_dto_1 = require("./dto/transcribe-audio.dto");
const text_to_speech_dto_1 = require("./dto/text-to-speech.dto");
const chat_gateway_1 = require("../gateways/chat.gateway");
let AIController = class AIController {
    aiService;
    utils;
    chatGateway;
    constructor(aiService, utils, chatGateway) {
        this.aiService = aiService;
        this.utils = utils;
        this.chatGateway = chatGateway;
    }
    async transcribeAudio(user, transcribeAudioDto, res) {
        try {
            console.log('Transcription request received for user:', user._id);
            const result = await this.aiService.transcribeAudioForChat({
                userId: user._id.toString(),
                transcribeAudioDto,
            });
            console.log('Transcription result:', result.success, result.message);
            if (result.success && result.data?.message) {
                console.log('Broadcasting transcribed message to chat room');
                this.chatGateway.broadcastMessage(transcribeAudioDto.chatId, result.data.message);
            }
            this.utils.apiResponse({
                res,
                success: result.success,
                code: result.code,
                message: result.message,
                data: result.data,
            });
        }
        catch (error) {
            console.error('Error in transcribe endpoint:', error);
            this.utils.apiResponse({
                res,
                success: false,
                code: 500,
                message: 'Internal server error during transcription',
                data: null,
            });
        }
    }
    async textToSpeech(user, textToSpeechDto, res) {
        const result = await this.aiService.generateSpeechForChat({
            userId: user._id.toString(),
            textToSpeechDto,
        });
        this.utils.apiResponse({
            res,
            success: result.success,
            code: result.code,
            message: result.message,
            data: result.data,
        });
    }
};
exports.AIController = AIController;
__decorate([
    (0, common_1.Post)('transcribe'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, transcribe_audio_dto_1.TranscribeAudioDto, Object]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "transcribeAudio", null);
__decorate([
    (0, common_1.Post)('text-to-speech'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, text_to_speech_dto_1.TextToSpeechDto, Object]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "textToSpeech", null);
exports.AIController = AIController = __decorate([
    (0, common_1.Controller)('ai'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => chat_gateway_1.ChatGateway))),
    __metadata("design:paramtypes", [ai_service_1.AIService,
        response_util_1.ResponseUtil,
        chat_gateway_1.ChatGateway])
], AIController);
//# sourceMappingURL=ai.controller.js.map