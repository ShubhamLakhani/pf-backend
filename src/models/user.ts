import mongoose, { Schema } from 'mongoose';
import { IMoongo } from '../utils/common.interface';

// Define the User interface
export interface IUser extends IMoongo {
  _id: string;
  name: string;
  mobileNumber: string;
  address: string;
  otp: number;
  otpExpiry: number;
  isActive: boolean;
  profileImage?: string;
}

// Create the User schema
const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    mobileNumber: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    profileImage: { type: String, required: false },
    otp: { type: Number, default: null },
    otpExpiry: { type: Number },
    isActive: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Create and export the User model
export const userModel = mongoose.model<IUser>('user', UserSchema);
