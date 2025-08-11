import Joi from 'joi';

export const paramMongoIdSchema = Joi.object({
  id: Joi.string()
    // .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
});

export const queryMongoIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
});

export const deleteRequestValidationSchema = Joi.object({
  name: Joi.string().required(),
  mobileNumber: Joi.string().required(),
});
export const contactUsValidationSchema = Joi.object({
  name: Joi.string().required(),
  mobileNumber: Joi.string().required(),
  // email: Joi.string().required(),
  // address: Joi.string().required(),
  serviceId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
});