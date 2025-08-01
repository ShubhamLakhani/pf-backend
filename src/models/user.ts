import mongoose, { Schema } from 'mongoose';
import { IMoongo } from '../utils/common.interface';

// Define the User interface
export interface IUser extends IMoongo {
  _id: string;
  name: string;
  mobileNumber: string;
  alternateMobileNumber: string;
  address: string;
  otp: number;
  otpExpiry: number;
  isActive: boolean;
  profileImage?: string;
  removeAlternateMobileNumber: boolean;
  alternateMobileNumberOtp: number;
  alternateMobileNumberOtpExpiry: Date;
  isAlternateMobileNumberVerified: boolean;
}

// Create the User schema
const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: false },
    mobileNumber: { type: String, required: true, unique: true },
    address: { type: String, required: false },
    profileImage: { type: String, required: false },
    otp: { type: Number, default: null },
    otpExpiry: { type: Number },
    isActive: { type: Boolean, default: true },
    alternateMobileNumber: { type: String, required: false, default: null },
    alternateMobileNumberOtp: { type: Number, default: null },
    alternateMobileNumberOtpExpiry: { type: Number },
    isAlternateMobileNumberVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Create and export the User model
export const userModel = mongoose.model<IUser>('user', UserSchema);
