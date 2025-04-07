import mongoose, { Schema } from 'mongoose';
import { IMoongo } from '../utils/common.interface';
import {
  BookingPaymentStatusEnum,
  ConsultationStatusEnum,
  consultationTypeEnum,
} from '../enums';

// Define the Consultation interface
export interface IConsultation extends IMoongo {
  _id: string;
  petId: string;
  startDateTime: Date;
  endDateTime: Date;
  appointmentReason?: string;
  userId: string;
  paymentStatus?: BookingPaymentStatusEnum;
  providerOrderId?: string;
  providerOrderStatus?: string;
  providerData?: any;
  consultationStatus?: ConsultationStatusEnum;
  consultationType: consultationTypeEnum;
}

// Create the Consultation schema
const ConsultationSchema: Schema = new Schema(
  {
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: 'pets',
    },
    startDateTime: { type: Date, required: true },
    endDateTime: { type: Date, required: true },
    appointmentReason: { type: String, default: null },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: 'users',
    },
    paymentStatus: {
      type: String,
      enum: BookingPaymentStatusEnum,
      default: BookingPaymentStatusEnum.pending,
    },
    providerOrderId: { type: String, default: null },
    providerOrderStatus: { type: String, default: null },
    providerData: { type: Object, default: null },
    consultationStatus: {
      type: String,
      enum: ConsultationStatusEnum,
      default: ConsultationStatusEnum.pending,
    },
    consultationType: {
      type: String,
      enum: consultationTypeEnum,
      default: consultationTypeEnum.normal,
    },
  },
  {
    timestamps: true,
  }
);

// Create and export the Consultation model
export const consultationModel = mongoose.model<IConsultation>(
  'consultation',
  ConsultationSchema
);
