export const serviceConsultationPriceObj = {
  amount: 100,
  discountedAmount: 100,
};
export const serviceConsultationEuthanasiaPriceObj = {
  amount: 100,
  discountedAmount: 100,
};

export const serviceConsultationEuthanasiaPriceObjOnline = {
  amount: 100,
  discountedAmount: 100,
};

export const whatsappTemplatesName:Record<string, string> = {
  Euthanasia: 'euthanasia_appointment_new',
  Normal: 'online_consultation' /* Normal(Consultation) appointment */,
  Travel: 'travel_certificate',
  vaccinations: 'vaccination_appoinment',
  surgery: 'surgery',
  'check-ups': 'health_checkup',
  'hospital-visit': 'hospital_appointment',
  'blood-tests': 'blood_test',
};

export const whatsappTemplateImage: Record<string, string> = {
  euthanasia_appointment_new:
    'https://dev-pet-first.s3.ap-south-1.amazonaws.com/assets/whatsapp-template-image/WA+8.jpeg',
  travel_certificate:
    'https://dev-pet-first.s3.ap-south-1.amazonaws.com/assets/whatsapp-template-image/WA+7.jpeg',
  hospital_appointment:
    'https://dev-pet-first.s3.ap-south-1.amazonaws.com/assets/whatsapp-template-image/WA+5.jpeg',
  vaccination_appoinment:
    'https://dev-pet-first.s3.ap-south-1.amazonaws.com/assets/whatsapp-template-image/WA+2.jpeg',
  blood_test:
    'https://dev-pet-first.s3.ap-south-1.amazonaws.com/assets/whatsapp-template-image/WA+4.jpeg',
  surgery:
    'https://dev-pet-first.s3.ap-south-1.amazonaws.com/assets/whatsapp-template-image/WA+6.jpeg',
  online_consultation:
    'https://dev-pet-first.s3.ap-south-1.amazonaws.com/assets/whatsapp-template-image/WA+1.jpeg',
  health_checkup:
    'https://dev-pet-first.s3.ap-south-1.amazonaws.com/assets/whatsapp-template-image/WA+3.jpeg',
};
