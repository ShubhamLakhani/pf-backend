import mongoose, { Schema } from 'mongoose';
import { IMoongo } from '../utils/common.interface';

// Define the User interface
export interface IServiceConfig extends IMoongo {
  _id: string;
  name: string;
  metaData: any;
}

// Create the User schema
const ServiceConfigSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    metaData: { type: Object, default: null },
  },
  {
    timestamps: true,
  }
);

// Create and export the Service model
export const serviceConfigModel = mongoose.model<IServiceConfig>(
  'serviceConfig',
  ServiceConfigSchema
);
