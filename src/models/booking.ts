import mongoose, { Schema } from 'mongoose';
import { BookingPaymentStatusEnum, BookingStatusEnum } from '../enums';
import { IMoongo } from '../utils/common.interface';

// Define the Booking interface
export interface IBooking extends IMoongo {
  _id: string;
  serviceId: string;
  serviceItemId: string;
  serviceRecordId?: string;
  petId: string;
  branchId: string;
  bookingStatus: BookingStatusEnum;
  startDateTime: Date;
  endDateTime: Date;
  appointmentReason?: string;
  userId: string;
  lastDateTime: Date;
  bookingPaymentStatus?: BookingPaymentStatusEnum;
  providerOrderId?: string;
  providerOrderStatus?: string;
  providerData?: any;
  timeSlotLabel?: string;
  amount: number;
}

// Create the Booking schema
const BookingSchema: Schema = new Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: 'services',
    },
    serviceItemId: {
      type: mongoose.Schema.Types.ObjectId,
      require: false,
      ref: 'serviceItems',
    },
    serviceRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: 'serviceRecord',
    },
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: 'pets',
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      require: false,
      ref: 'branches',
    },
    bookingStatus: {
      type: String,
      enum: BookingStatusEnum,
      default: BookingStatusEnum.upcoming,
    },
    startDateTime: { type: Date, required: true },
    endDateTime: { type: Date, required: true },
    appointmentReason: { type: String, default: null },
    amount: { type: Number, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: 'users',
    },
    bookingPaymentStatus: {
      type: String,
      enum: BookingPaymentStatusEnum,
      default: BookingPaymentStatusEnum.pending,
    },
    providerOrderId: { type: String, default: null },
    providerOrderStatus: { type: String, default: null },
    providerData: { type: Object, default: null },
    timeSlotLabel: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

// Create and export the Booking model
export const bookingModel = mongoose.model<IBooking>('booking', BookingSchema);
