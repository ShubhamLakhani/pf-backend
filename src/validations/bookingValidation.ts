import Joi from 'joi';
import {
  consultationTypeEnum,
  euthanasiaTypeEnum,
  TravelTypeEnum,
} from '../enums';

export const bookingValidationSchema = Joi.object({
  serviceItemId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  serviceId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  petId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional().allow("", null),
  branchId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .allow(null),
  startDateTime: Joi.date().iso().required(),
  endDateTime: Joi.date().iso().greater(Joi.ref('startDateTime')).required(),
  appointmentReason: Joi.string().allow(null, "").optional(),
  timeSlotLabel: Joi.string().allow(null).optional(),
});

export const consultationBookingValidationSchema = Joi.object({
  petId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional().allow("", null),
  startDateTime: Joi.when('consultationType', {
    is: consultationTypeEnum.euthanasia,
    then: Joi.when('euthanasiaType', {
      is: euthanasiaTypeEnum.online,
      then: Joi.date().iso().required(),
      otherwise: Joi.date().iso().optional(),
    }),
    otherwise: Joi.date().iso().required(),
  }),
  endDateTime: Joi.when('consultationType', {
    is: consultationTypeEnum.euthanasia,
    then: Joi.when('euthanasiaType', {
      is: euthanasiaTypeEnum.online,
      then: Joi.date().iso().greater(Joi.ref('startDateTime')).required(),
      otherwise: Joi.date().iso().greater(Joi.ref('startDateTime')).optional(),
    }),
    otherwise: Joi.date().iso().greater(Joi.ref('startDateTime')).required(),
  }),
  appointmentReason: Joi.string().allow(null, "").optional(),
  consultationType: Joi.string()
    .valid(...Object.values(consultationTypeEnum))
    .required(),
  euthanasiaType: Joi.when('consultationType', {
    is: consultationTypeEnum.euthanasia,
    then: Joi.string()
      .valid(...Object.values(euthanasiaTypeEnum))
      .required(),
    otherwise: Joi.forbidden(),
  }),
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

export const travelBookingValidationSchema = Joi.object({
  petId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional().allow("", null),
  travelType: Joi.string()
    .valid(...Object.values(TravelTypeEnum))
    .required(),
  travelDate: Joi.date().iso().min('now').required(),
  microchipNumber: Joi.string().min(15).max(15).when('travelType', {
    is: TravelTypeEnum.international,
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  isFitToTravelCertificate: Joi.boolean().required(),
  isHealthCertificate: Joi.boolean().required(),
  isBloodTiterTest: Joi.boolean().when('travelType', {
    is: TravelTypeEnum.international,
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  isNoObjectionCertificate: Joi.boolean().when('travelType', {
    is: TravelTypeEnum.international,
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  requiredCertificates: Joi.string().allow(null).when('travelType', {
    is: TravelTypeEnum.international,
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
});

export const travelUpdateValidationSchema = Joi.object({
  _id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
});
