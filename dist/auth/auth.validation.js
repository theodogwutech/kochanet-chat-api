"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordSchema = exports.VerifyOtpSchema = exports.ResendOtpSchema = exports.VerifyEmailSchema = exports.ForgotPasswordSchema = exports.LoginSchema = exports.RegisterSchema = void 0;
const Joi = require("joi");
exports.RegisterSchema = Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().min(2).max(50).required(),
    password: Joi.string().min(6).max(128).required(),
});
exports.LoginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(128).required(),
});
exports.ForgotPasswordSchema = Joi.object({
    email: Joi.string().email().required(),
});
exports.VerifyEmailSchema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
});
exports.ResendOtpSchema = Joi.object({
    email: Joi.string().email().required(),
});
exports.VerifyOtpSchema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
});
exports.ResetPasswordSchema = Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string().min(6).max(128).required(),
    confirmPassword: Joi.string()
        .min(6)
        .max(128)
        .required()
        .valid(Joi.ref('newPassword')),
});
//# sourceMappingURL=auth.validation.js.map