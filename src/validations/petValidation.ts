import Joi from 'joi';
import {
  PetFriendlyEnum,
  PetNeuteredEnum,
  PetSexEnum,
  PetSizeEnum,
  PetTypeEnum,
} from '../enums';

export const petValidationSchema = Joi.object({
  name: Joi.string().required(),
  petType: Joi.string()
    .valid(...Object.values(PetTypeEnum))
    .required(),
  breed: Joi.string().required(),
  sex: Joi.string()
    .valid(...Object.values(PetSexEnum))
    .required(),
  weight: Joi.number().required(),
  size: Joi.string()
    .valid(...Object.values(PetSizeEnum))
    .required(),
  age: Joi.number().required(),
  neutered: Joi.string()
    .valid(...Object.values(PetNeuteredEnum))
    .required(),
  friendly: Joi.string()
    .valid(...Object.values(PetFriendlyEnum))
    .required(),
});

export const petUpdateValidationSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
  name: Joi.string().optional(),
  image: Joi.string().optional().allow(''),
  petType: Joi.string()
    .valid(...Object.values(PetTypeEnum))
    .optional(),
  breed: Joi.string().optional(),
  sex: Joi.string()
    .valid(...Object.values(PetSexEnum))
    .optional(),
  weight: Joi.number().optional(),
  size: Joi.string()
    .valid(...Object.values(PetSizeEnum))
    .optional(),
  age: Joi.number().optional(),
  neutered: Joi.string()
    .valid(...Object.values(PetNeuteredEnum))
    .optional(),
  friendly: Joi.string()
    .valid(...Object.values(PetFriendlyEnum))
    .optional(),
});
