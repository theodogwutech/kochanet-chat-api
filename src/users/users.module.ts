import { Module, NestModule, MiddlewareConsumer, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserSchema } from '../models/user.model';
import { UserRepository } from '../repositories/user.repository';
import { ResponseUtil } from '../common/utils/response.util';
import { AuthenticationMiddleware } from '../common/middleware/auth.middleware';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, UserRepository, ResponseUtil, AuthenticationMiddleware],
  exports: [UsersService, UserRepository],
})
export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticationMiddleware).forRoutes(UsersController);
  }
}
