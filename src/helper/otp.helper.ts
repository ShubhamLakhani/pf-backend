import axios from 'axios';

const MSG91_API_URL = process.env.MSG91_API_URL || 'https://control.msg91.com';
const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID;

export const sendOtpToUser = async (mobileNumber: string, otp: number) => {
  try {
    const response = await axios.post(
      MSG91_API_URL + '/api/v5/flow',
      {
        template_id: MSG91_TEMPLATE_ID,
        short_url: '0',
        realTimeResponse: '1',
        recipients: [
          {
            mobiles: `91${mobileNumber}`,
            otp,
          },
        ],
      },
      {
        headers: {
          Accept: 'application/json',
          authkey: MSG91_AUTH_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Success:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Error sending OTP');
  }
};
