import * as Joi from 'joi';

export const RegisterSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().min(2).max(50).required(),
  password: Joi.string().min(6).max(128).required(),
});

export const LoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
});

export const ForgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const VerifyEmailSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
});

export const ResendOtpSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const VerifyOtpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
});

export const ResetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(6).max(128).required(),
  confirmPassword: Joi.string()
    .min(6)
    .max(128)
    .required()
    .valid(Joi.ref('newPassword')),
});
