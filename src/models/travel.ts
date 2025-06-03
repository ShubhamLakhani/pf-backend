import mongoose, { Types } from 'mongoose';
import { BookingPaymentStatusEnum, TravelTypeEnum } from '../enums';
import { IMoongo } from '../utils/common.interface';
import { required } from 'joi';

// Define the Travel interface
export interface ITravel extends IMoongo {
  petId: Types.ObjectId;
  travelType: TravelTypeEnum;
  travelDate: Date;
  microchipNumber?: string | null;
  vaccinationRecord: string;
  isFitToTravelCertificate: boolean;
  isHealthCertificate: boolean;
  isBloodTiterTest?: boolean;
  isNoObjectionCertificate?: boolean;
  requiredCertificates?: string | null;
  userId: Types.ObjectId;
  paymentStatus?: BookingPaymentStatusEnum;
  providerOrderId?: string;
  providerOrderStatus?: string;
  providerData?: any;
  travelCertificate?: string | null;
  amount: number;
}

// Create the Travel schema
const TravelSchema = new mongoose.Schema(
  {
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Pet',
    },
    travelType: {
      type: String,
      enum: TravelTypeEnum,
      required: true,
    },
    travelDate: {
      type: Date,
      required: true,
    },
    microchipNumber: {
      type: String,
      default: null,
    },
    vaccinationRecord: {
      type: String,
      required: true,
    },
    isFitToTravelCertificate: {
      type: Boolean,
      default: false,
    },
    isHealthCertificate: {
      type: Boolean,
      default: false,
    },
    isBloodTiterTest: {
      type: Boolean,
      default: false,
    },
    isNoObjectionCertificate: {
      type: Boolean,
      default: false,
    },
    requiredCertificates: {
      type: String,
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    travelCertificate: {
      type: String,
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: BookingPaymentStatusEnum,
      default: BookingPaymentStatusEnum.pending,
    },
    providerOrderId: { type: String, default: null },
    providerOrderStatus: { type: String, default: null },
    providerData: { type: Object, default: null },
    amount: { type: Number, required: true },
  },
  { timestamps: true }
);

// Create and export the Travel model
export const travelModel = mongoose.model<ITravel>('travel', TravelSchema);
