/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import Joi from 'joi';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private readonly schema: Joi.ObjectSchema) {}

  transform(value: unknown): unknown {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const { error } = this.schema.validate(value, { abortEarly: false });

    if (error) {
      throw new HttpException(
        {
          success: false,
          code: HttpStatus.BAD_REQUEST,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
          message: error.details.map((detail) => detail.message).join(', '),
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return value;
  }
}
