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
