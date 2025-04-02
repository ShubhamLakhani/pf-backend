import mongoose, { Schema } from 'mongoose';
import { IMoongo } from '../utils/common.interface';

// Define the Inquiry interface
export interface IInquiry extends IMoongo {
  _id: string;
  name: string;
  mobileNumber: string;
  address: string;
}

// Create the Inquiry schema
const InquirySchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    address: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Create and export the Inquiry model
export const inquiryModel = mongoose.model<IInquiry>('inquiry', InquirySchema);
