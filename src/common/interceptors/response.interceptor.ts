import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data: any): Response<T> => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode || HttpStatus.OK;

        // If data is already in the correct format, return it
        if (
          data &&
          typeof data === 'object' &&
          'success' in data &&
          'code' in data &&
          'message' in data
        ) {
          return data as Response<T>;
        }

        // Otherwise, wrap it in the standard format
        return {
          success: statusCode < 400,
          code: statusCode,
          message: data?.message || 'Success',
          data: data?.data !== undefined ? data.data : data,
        };
      }),
    );
  }
}
