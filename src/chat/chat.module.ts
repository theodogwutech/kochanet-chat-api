import { Module, NestModule, MiddlewareConsumer, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatSchema } from '../models/chat.model';
import { ChatRepository } from '../repositories/chat.repository';
import { ResponseUtil } from '../common/utils/response.util';
import { AuthenticationMiddleware } from '../common/middleware/auth.middleware';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Chat', schema: ChatSchema }]),
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatRepository, ResponseUtil, AuthenticationMiddleware],
  exports: [ChatService],
})
export class ChatModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticationMiddleware).forRoutes(ChatController);
  }
}
