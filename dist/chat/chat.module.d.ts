import { NestModule, MiddlewareConsumer } from '@nestjs/common';
export declare class ChatModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void;
}
