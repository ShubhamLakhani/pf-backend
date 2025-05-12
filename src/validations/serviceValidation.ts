import Joi from 'joi';
import { consultationTypeEnum } from '../enums';

export const createServiceItemSchema = Joi.object({
  serviceId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
  name: Joi.string().required(),
  amount: Joi.number().required(),
  discountedAmount: Joi.number().default(0),
  image: Joi.string().allow('').default(null).empty(),
  metaData: Joi.object().allow(null).default(null),
});

export const updateServiceItemSchema = Joi.object({
  _id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
  name: Joi.string().optional(),
  amount: Joi.number().optional(),
  discountedAmount: Joi.number().default(0).optional(),
  image: Joi.string().allow('').default(null).empty().optional(),
  metaData: Joi.object().allow(null).default(null),
});

export const updateServiceSchema = Joi.object({
  _id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
  name: Joi.string().optional(),
  amount: Joi.number().optional(),
  discountedAmount: Joi.number().default(0).optional(),
  image: Joi.string().allow('').empty().optional(),
  mobileImage: Joi.string().allow('').empty().optional(),
  description: Joi.string().optional(),
});

export const updateServicePriceSchema = Joi.object({
  amount: Joi.number().required(),
  discountedAmount: Joi.number().default(0).required(),
  consultationType: Joi.string()
    .valid(...Object.values(consultationTypeEnum))
    .required(),
});
