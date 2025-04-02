import Joi from 'joi';

export const bookingValidationSchema = Joi.object({
  serviceItemId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  serviceId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  petId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
  branchId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  startDateTime: Joi.date().iso().required(),
  endDateTime: Joi.date().iso().greater(Joi.ref('startDateTime')).required(),
  appointmentReason: Joi.string().allow(null),
  timeSlotLabel: Joi.string().allow(null).optional(),
});

export const consultationBookingValidationSchema = Joi.object({
  petId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
  startDateTime: Joi.date().iso().required(),
  endDateTime: Joi.date().iso().greater(Joi.ref('startDateTime')).required(),
  appointmentReason: Joi.string().allow(null),
});

export const vaccinationLastRecordValidationSchema = Joi.object({
  serviceItemId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .allow(null, '')
    .optional(),
  serviceId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
  name: Joi.string().when('serviceItemId', {
    is: Joi.alternatives().try(null, ''),
    then: Joi.required(),
  }),
  petId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
  lastDateTime: Joi.date().iso().required(),
});

export const adminUpdateServiceRecordValidationSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
  serviceItemId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  lastDateTime: Joi.date().iso().optional(),
});

export const vaccinationUpdateLastRecordValidationSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
  serviceItemId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .allow(null, '')
    .optional(),
  serviceId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  name: Joi.string().optional(),
  petId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  lastDateTime: Joi.date().iso().optional(),
});

export const consultationUpdateValidationSchema = Joi.object({
  _id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
  startDateTime: Joi.date().iso().required(),
  endDateTime: Joi.date().iso().greater(Joi.ref('startDateTime')).required(),
});
