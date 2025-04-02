import { serviceConsultationPriceObj } from '../constants';
import { serviceModel } from '../models/service';
import { serviceConfigModel } from '../models/serviceConfig';

export const createDefaultService = async () => {
  const checkService = await serviceModel.findOne();
  const checkConfig = await serviceConfigModel.findOne({
    name: 'CONSULTATION',
  });

  if (checkConfig) {
    const { amount, discountedAmount } = checkConfig.metaData;
    serviceConsultationPriceObj.amount = amount;
    serviceConsultationPriceObj.discountedAmount = discountedAmount;
  }

  if (checkService) {
    return true;
  }

  const data = [
    {
      name: 'Home Vaccinations',
      slug: 'vaccinations',
      serviceType: 'Home',
      description: 'Vaccinations at your dorrstap hassle-free.',
    },
    {
      name: 'Pet Health Check-Up',
      slug: 'check-ups',
      serviceType: 'Health',
      description: "Compreshensive check-ups for your pet's health.",
    },
    {
      name: 'Home Blood Tests',
      slug: 'blood tests',
      serviceType: 'Home',
      description: 'Quick and reliable blood tests at home.',
    },
    {
      name: 'Travel Certificate',
      slug: 'travel-certificate',
      serviceType: 'Online',
    },
    {
      name: 'Book Surgery',
      slug: 'surgery',
      serviceType: 'Book',
      description: 'simple online booking for safe surgeries.',
    },
    {
      name: 'Book Hospital Visit',
      slug: 'hospital visit',
      serviceType: 'Book',
      amount: 120,
      discountedAmount: 20,
      description: 'Schedule expert veterinary care at the hospital.',
    },
  ];

  const configData = [
    {
      name: 'CONSULTATION',
      metaData: { ...serviceConsultationPriceObj },
    },
  ];

  await Promise.all([
    serviceModel.insertMany(data),
    serviceConfigModel.insertMany(configData),
  ]);

  return true;
};

// Automatically call the function
createDefaultService().catch(error => {
  console.log('Error creating default services:', error);
});
