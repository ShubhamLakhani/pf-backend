import Joi from 'joi';

// Define validation schemas for branch
export const branchSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
});
