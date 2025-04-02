import Joi from 'joi';

// Define validation schemas for auth
export const signUpSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  mobileNumber: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .required(),
  address: Joi.string().min(3).required(),
});

export const validateOtpSchema = Joi.object({
  mobileNumber: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .required(),
  otp: Joi.number().required(),
});

export const signInSchema = Joi.object({
  mobileNumber: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .required(),
});

export const adminSignInSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});
