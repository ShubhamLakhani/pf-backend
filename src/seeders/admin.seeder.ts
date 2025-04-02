import { hashPassword } from '../helper/common.helper';
import { adminModel } from '../models/admin';

export const createAdmin = async () => {
  const checkService = await adminModel.findOne();

  if (checkService) {
    return true;
  }

  let data: any = process.env.ADMIN_DATA;

  if (!data) {
    process.exit(1);
  }

  data = JSON.parse(data);
  data.password = await hashPassword(data.password);

  await adminModel.create(data);

  return true;
};

// Automatically call the function
createAdmin().catch(error => {
  console.log('Error creating default admin:', error);
});
