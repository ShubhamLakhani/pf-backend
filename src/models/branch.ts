import mongoose, { Schema } from 'mongoose';
import { IMoongo } from '../utils/common.interface';

// Define the Branch interface
export interface IBranch extends IMoongo {
  _id: string;
  name: string;
}

// Create the Branch schema
const branchSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Create and export the Branch model
export const branchModel = mongoose.model<IBranch>('branch', branchSchema);
