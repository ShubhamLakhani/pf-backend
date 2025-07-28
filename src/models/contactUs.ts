import mongoose, { Schema } from 'mongoose';
import { IMoongo } from '../utils/common.interface';

// Define the ContactUs interface
export interface IContactUs extends IMoongo {
  _id: string;
  name: string;
  mobileNumber: string;
  address: string;
  email: string;
  serviceId: string;
}

// Create the ContactUs schema
const ContactUsSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    address: { type: String, required: true },
    email: { type: String, required: true },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: 'services',
    },
  },
  {
    timestamps: true,
  }
);

// Create and export the ContactUs model
export const contactUsModel = mongoose.model<IContactUs>('contact-us', ContactUsSchema);
