import mongoose, { Schema } from 'mongoose';
import { IMoongo } from '../utils/common.interface';

// Define the User interface
export interface IServiceRecord extends IMoongo {
  _id: string;
  serviceId: string;
  serviceItemId: string | null;
  petId: string;
  lastDateTime: Date;
  image?: string;
  userId: string;
  name?: string;
}

// Create the User schema
const ServiceRecordSchema: Schema = new Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: 'services',
    },
    serviceItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'serviceItems',
      default: null,
    },
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: 'pets',
    },
    lastDateTime: { type: Date, required: false },
    image: { type: String, default: null },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: 'users',
    },
    name: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Create and export the Service model
export const serviceRecordModel = mongoose.model<IServiceRecord>(
  'serviceRecord',
  ServiceRecordSchema
);
