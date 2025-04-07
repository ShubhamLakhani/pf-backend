import { Document } from 'mongoose';
import { consultationTypeEnum } from '../enums';

export interface IMoongo extends Document {
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OtpWithExpiry {
  otp: number;
  expiresAt: Date;
}

export interface IServicePrice {
  amount: number;
  discountedAmount: number;
  consultationType: consultationTypeEnum;
}
