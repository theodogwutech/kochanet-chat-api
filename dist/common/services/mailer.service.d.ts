import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    sendEmail({ to, subject, templateName, context, }: {
        to: string;
        subject: string;
        templateName: string;
        context: Record<string, any>;
    }): Promise<void>;
    private renderTemplate;
}
