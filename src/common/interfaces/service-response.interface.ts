/**
 * Service Response Interface
 * Standardized return type for all service methods
 */
export interface ServiceResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
}

/**
 * API Response Parameters
 * Parameters for sending standardized API responses
 */
export interface ApiResponseParams<T = any> {
  res: any; // Express Response
  success: boolean;
  code: number;
  message: string;
  data?: T;
}
