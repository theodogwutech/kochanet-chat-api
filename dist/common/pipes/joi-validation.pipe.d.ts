import { PipeTransform } from '@nestjs/common';
import Joi from 'joi';
export declare class JoiValidationPipe implements PipeTransform {
    private readonly schema;
    constructor(schema: Joi.ObjectSchema);
    transform(value: unknown): unknown;
}
