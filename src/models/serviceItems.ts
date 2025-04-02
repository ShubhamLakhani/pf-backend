import mongoose, { Schema } from 'mongoose';
import { IMoongo } from '../utils/common.interface';

// Define the Service Item interface
export interface IServiceItems extends IMoongo {
  _id: string;
  serviceId: string;
  name: string;
  amount: number;
  discountedAmount: number;
  image?: string;
  metaData: any;
  slug: string;
}

// Create the User schema
const ServiceItemsSchema: Schema = new Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: 'services',
    },
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    discountedAmount: { type: Number, default: 0 },
    image: { type: String, default: null },
    metaData: { type: Object, default: null },
    slug: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Create and export the Service model
export const serviceItemsModel = mongoose.model<IServiceItems>(
  'serviceItem',
  ServiceItemsSchema
);
