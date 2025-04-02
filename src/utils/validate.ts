import Joi from 'joi';

interface ValidationResult<T> {
  isValid: boolean;
  value: T;
  message: string;
}

export const validation = <T>(
  payload: T,
  schemaKeys: Joi.ObjectSchema
): ValidationResult<T> => {
  const { value, error } = schemaKeys.validate(payload, {
    abortEarly: false,
  });

  if (error && error.details) {
    const message =
      error.details.map(el => el.message).join('\n') || 'Validation error';

    return {
      isValid: false,
      message,
    } as ValidationResult<T>;
  }
  return { isValid: true, message: '', value };
};
