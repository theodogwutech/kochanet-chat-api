export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RegisterDto {
    email: string;
    name: string;
    password: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class VerifyEmailDto {
    email: string;
    otp: string;
}
export declare class ResendOtpDto {
    email: string;
}
export declare class VerifyOtpDto {
    email: string;
    otp: string;
}
export declare class ResetPasswordDto {
    token: string;
    newPassword: string;
    confirmPassword: string;
}
