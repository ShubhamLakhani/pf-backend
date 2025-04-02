import mongoose, { Schema } from 'mongoose';
import { IMoongo } from '../utils/common.interface';

// Define the User interface
export interface IService extends IMoongo {
  _id: string;
  name: string;
  serviceType: string;
  image?: string;
  description: string;
  slug?: string;
  amount?: number;
  discountedAmount?: number;
  mobileImage?: string;
}

// Create the User schema
const ServiceSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    serviceType: { type: String, required: true },
    image: { type: String, default: null },
    description: { type: String, default: null },
    slug: { type: String, default: null },
    amount: { type: Number, default: 0 },
    discountedAmount: { type: Number, default: 0 },
    mobileImage: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

// Create and export the Service model
export const serviceModel = mongoose.model<IService>('service', ServiceSchema);
