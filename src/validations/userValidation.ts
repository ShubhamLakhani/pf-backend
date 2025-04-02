import Joi from 'joi';

export const userDetailsValidationSchema = Joi.object({
  name: Joi.string().optional(),
  mobileNumber: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .optional(),
  address: Joi.string().optional(),
});
