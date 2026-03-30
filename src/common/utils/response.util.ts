import { Injectable } from '@nestjs/common';
import { ApiResponseParams } from '../interfaces/service-response.interface';

/**
 * Response Utility Service
 */
@Injectable()
export class ResponseUtil {
  /**
   * Send standardized API response
   */
  apiResponse(params: ApiResponseParams): void {
    const { res, success, code, message, data } = params;

    res.status(code).json({
      success,
      code,
      message,
      data: data || null,
    });
  }
}
