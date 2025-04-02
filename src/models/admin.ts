import mongoose, { Schema } from 'mongoose';
import { IMoongo } from '../utils/common.interface';

// Define the Admin interface
export interface IAdmin extends IMoongo {
  _id: string;
  name: string;
  email: string;
  password: string;
}

// Create the Admin schema
const AdminSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Create and export the Admin model
export const adminModel = mongoose.model<IAdmin>('admin', AdminSchema);
