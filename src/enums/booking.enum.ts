export enum BookingStatusEnum {
  upcoming = 'Upcoming',
  finished = 'Finished',
  ongoing = 'Ongoing',
  canceled = 'Canceled',
  DELAYED = 'Delayed',
}

export enum BookingPaymentStatusEnum {
  pending = 'Pending',
  success = 'Success',
  Failed = 'Failed',
  canceled = 'Canceled',
}

export enum ConsultationStatusEnum {
  pending = 'Pending',
  success = 'Success',
  rescaduled = 'Rescaduled',
  canceled = 'Canceled',
}

export enum TravelTypeEnum {
  domestic = 'Domestic',
  international = 'International',
}

export enum consultationTypeEnum {
  normal = 'Normal',
  euthanasia = 'Euthanasia',
  euthanasiaOnline = 'Euthanasia Online',
}

export enum euthanasiaTypeEnum {
  online = 'Online',
  home = 'Home',
}