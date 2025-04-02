import mongoose, { Schema, SchemaType } from 'mongoose';
import {
  PetFriendlyEnum,
  PetNeuteredEnum,
  PetSexEnum,
  PetSizeEnum,
  PetTypeEnum,
} from '../enums';
import { IMoongo } from '../utils/common.interface';

// Define the User interface
export interface IPet extends IMoongo {
  _id: string;
  name: string;
  image?: string;
  petType: PetTypeEnum;
  breed: string;
  sex: PetSexEnum;
  weight: number;
  size: PetSizeEnum;
  age: number;
  neutered: PetNeuteredEnum;
  friendly: PetFriendlyEnum;
  userId: string;
  slug: string;
}

// Create the User schema
const PetSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    petType: { type: String, enum: PetTypeEnum, required: true },
    breed: { type: String, required: true },
    sex: { type: String, enum: PetSexEnum, required: true },
    weight: { type: Number, required: true },
    size: { type: String, enum: PetSizeEnum, required: true },
    age: { type: Number, required: true },
    neutered: { type: String, enum: PetNeuteredEnum, required: true },
    friendly: { type: String, enum: PetFriendlyEnum, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    slug: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Create and export the User model
export const petModel = mongoose.model<IPet>('pet', PetSchema);
