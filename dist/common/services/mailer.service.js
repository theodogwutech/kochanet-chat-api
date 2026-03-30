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
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
const Handlebars = require("handlebars");
const fs = require("fs/promises");
const path = require("path");
const FormData = require("form-data");
let MailService = MailService_1 = class MailService {
    configService;
    logger = new common_1.Logger(MailService_1.name);
    constructor(configService) {
        this.configService = configService;
    }
    async sendEmail({ to, subject, templateName, context, }) {
        try {
            const html = await this.renderTemplate(templateName, context);
            const formData = new FormData();
            formData.append('from', this.configService.get('MAILGUN_FROM') ||
                'Kochanet Chat <noreply@kochanet.com>');
            formData.append('to', to);
            formData.append('subject', subject);
            formData.append('html', html);
            const mailgunDomain = this.configService.get('MAILGUN_DOMAIN');
            const mailgunApiKey = this.configService.get('MAILGUN_API_KEY');
            if (!mailgunDomain || !mailgunApiKey) {
                this.logger.warn('Mailgun credentials not configured. Email would have been sent to: ' +
                    to);
                this.logger.log(`Email subject: ${subject}`);
                return;
            }
            const response = await axios_1.default.post(`https://api.mailgun.net/v3/${mailgunDomain}/messages`, formData, {
                auth: {
                    username: 'api',
                    password: mailgunApiKey,
                },
                headers: formData.getHeaders(),
            });
            this.logger.log(`Email sent successfully to ${to}: ${response.data.message}`);
        }
        catch (error) {
            this.logger.error(`Failed to send email to ${to}: ${error.response?.data?.message || error.message}`);
            throw new Error(`Could not send email to ${to}. Please try again later.`);
        }
    }
    async renderTemplate(templateName, context) {
        try {
            const templatePath = path.join(__dirname, '../../../templates/emails', `${templateName}.hbs`);
            const templateContent = await fs.readFile(templatePath, 'utf8');
            const template = Handlebars.compile(templateContent);
            return template(context);
        }
        catch (error) {
            this.logger.error(`Error rendering template '${templateName}': ${error.message}`);
            throw new Error(`Failed to render email template: ${templateName}`);
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailService);
//# sourceMappingURL=mailer.service.js.map