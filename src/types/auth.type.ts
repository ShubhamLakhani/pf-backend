import { IUser } from '../models';

export interface ISignUp
  extends Pick<IUser, 'name' | 'mobileNumber' | 'address'> {}

export interface IValidateOtp extends Pick<IUser, 'otp' | 'mobileNumber'> {}

export interface ISignIn extends Pick<IUser, 'otp' | 'mobileNumber'> {}
