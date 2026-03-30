import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IUserDocument } from 'src/interfaces/user.interface';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IUserDocument => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as IUserDocument;
  },
);
