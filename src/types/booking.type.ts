import { IServiceItems } from '../models';

export interface ICreateBooking
  extends Pick<
    IServiceItems,
    'name' | 'amount' | 'discountedAmount' | 'serviceId'
  > {
  serviceName: string;
  serviceType: string;
}

export interface IAdminUpdateServiceRecord {
  id: string;
  serviceItemId?: string;
  startDateTime?: Date;
  endDateTime?: Date;
  lastDateTime?: Date;
  image?: string;
}
