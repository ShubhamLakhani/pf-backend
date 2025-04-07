import mongoose, { Schema } from 'mongoose';
import { IMoongo } from '../utils/common.interface';

// Define the Branch interface
export interface IBreeds extends IMoongo {
  _id: string;
  breed_name: string;
  slug: string;
  pet_type: 'dog' | 'cat';
}

// Create the Branch schema
const breedsSchema: Schema = new Schema(
  {
    breed_name: { type: String, required: true },
    slug: { type: String, required: true },
    pet_type: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Create and export the Branch model
export const breedsModel = mongoose.model<IBreeds>('breeds', breedsSchema);
