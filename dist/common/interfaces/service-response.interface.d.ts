export interface ServiceResponse<T = any> {
    success: boolean;
    code: number;
    message: string;
    data?: T;
}
export interface ApiResponseParams<T = any> {
    res: any;
    success: boolean;
    code: number;
    message: string;
    data?: T;
}
