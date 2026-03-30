import { Module, NestModule, MiddlewareConsumer, forwardRef } from '@nestjs/common';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { MessagesModule } from '../messages/messages.module';
import { AuthenticationMiddleware } from '../common/middleware/auth.middleware';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ResponseUtil } from '../common/utils/response.util';
import { GatewayModule } from '../gateways/gateway.module';

@Module({
  imports: [
    MessagesModule,
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
    forwardRef(() => GatewayModule),
  ],
  controllers: [AIController],
  providers: [AIService, AuthenticationMiddleware, ResponseUtil],
  exports: [AIService],
})
export class AIModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticationMiddleware).forRoutes(AIController);
  }
}
