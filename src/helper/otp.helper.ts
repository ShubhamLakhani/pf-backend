import axios from 'axios';
import { whatsappTemplateImage } from '../constants';

interface DynamicVariable {
  type: 'text' | 'image';
  parameters: {
    type: 'text' | 'image';
    text?: string;
    image?: { link: string };
  }[];
}

interface SMSData {
  serviceName: string | undefined;
  customerName: string;
  amount: number;
  date: string;
  time: string;
  customeNumber?: string;
}

interface SendMessageOptions {
  mobileNumber: string;
  templateName: string;
  dynamicVariables?: DynamicVariable[] | string[];
  mediaUrl?: string;
  dateAndTimeForSMS?: string[];
  smsData: SMSData;
}

const MSG91_API_URL = process.env.MSG91_API_URL || 'https://control.msg91.com';
const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID;
const MSG91_BOOKING_CONFIRMATION_TEMPLATE_ID = process.env.MSG91_BOOKING_CONFIRMATION_TEMPLATE_ID;
const MSG91_INTEGRATED_NUMBER = process.env.MSG91_INTEGRATED_NUMBER;

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
export const sendBookingConfirmationToUser = async (mobileNumber: string, smsData: SMSData) => {
  try {
    console.log({ mobileNumber})
    const response = await axios.post(
      MSG91_API_URL + '/api/v5/flow',
      {
        template_id: MSG91_BOOKING_CONFIRMATION_TEMPLATE_ID,
        short_url: '0',
        realTimeResponse: '1',
        recipients: [
          {
            mobiles: `91${mobileNumber}`,
            name: smsData.customerName,
            service_type: smsData.serviceName,
            date: smsData.date,
            time: smsData.time,
            amount: smsData.amount,
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
    throw new Error('Error sending Booking Confirmation');
  }
};
export const sendBookingConfirmationToAdmin = async (mobileNumber: string, smsData: SMSData) => {
  try {
    console.log({ mobileNumber})
    const response = await axios.post(
      MSG91_API_URL + '/api/v5/flow',
      {
        template_id: MSG91_BOOKING_CONFIRMATION_TEMPLATE_ID,
        short_url: '0',
        realTimeResponse: '1',
        recipients: [
          {
            mobiles: `91${mobileNumber}`,
            name: smsData.customerName,
            service_type: smsData.serviceName,
            date: smsData.date,
            time: smsData.time,
            amount: smsData.amount,
            contact_number: smsData.customeNumber
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
    throw new Error('Error sending Booking Confirmation');
  }
};

export const sendMessage = async ({
  mobileNumber,
  templateName,
  dynamicVariables = [],
  smsData
}: SendMessageOptions): Promise<any> => {
  /** Send welcome message on whatsapp */

  console.log('mobileNumber', mobileNumber, 'templateName', templateName, 'dynamicVariables', dynamicVariables);
  const raw: any = {
    integrated_number: MSG91_INTEGRATED_NUMBER,
    content_type: 'template',
    payload: {
      to: `91${mobileNumber}`,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: 'en',
          policy: 'deterministic',
        },
        components: [],
      },
      messaging_product: 'whatsapp',
    },
  };

  const mediaUrl = whatsappTemplateImage[templateName];
  if (mediaUrl) {
    raw.payload.template.components.push({
      type: 'header',
      parameters: [{ type: 'image', image: { link: mediaUrl } }],
    });
  }
  const variables = [...dynamicVariables];

  if (variables?.length) {
    raw.payload.template.components.push({
      type: 'body',
      parameters: variables.map(variable => ({
        type: 'text',
        text: variable,
      })),
    });
  }

  try {
    const response = await axios.post(
      'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/',
      raw,
      {
        headers: {
          'Content-Type': 'application/json',
          authkey: MSG91_AUTH_KEY,
        },
      }
    );
    const result = response.data;
    sendBookingConfirmationToUser(
      mobileNumber,
      smsData
    );
    sendBookingConfirmationToAdmin(
      '9611754001',
      {
        ...smsData,
        customeNumber: mobileNumber
      },
    );
    console.log('🚀 ~ result:', result);
    return result;
  } catch (error: any) {
    console.error('Error sending message:', error);
    return { error: error.message };
  }
};
