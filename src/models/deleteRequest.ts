import mongoose, { Schema } from 'mongoose';
import { IMoongo } from '../utils/common.interface';
import { DeleteRequestStatusEnum } from '../enums';

// Define the DeleteRequest interface
export interface IDeleteRequest extends IMoongo {
  _id: string;
  name: string;
  mobileNumber: string;
  status: DeleteRequestStatusEnum;
}

// Create the DeleteRequest schema
const DeleteRequestSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    mobileNumber: { type: String, required: true},
    status: { type: String, enum: DeleteRequestStatusEnum, default: DeleteRequestStatusEnum.pending },
  },
  {
    timestamps: true,
  }
);

// Create and export the DeleteRequest model
export const deleteRequestModel = mongoose.model<IDeleteRequest>('delete-request', DeleteRequestSchema);
