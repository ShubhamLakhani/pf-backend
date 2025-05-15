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

interface SendMessageOptions {
  mobileNumber: string;
  templateName: string;
  dynamicVariables?: DynamicVariable[] | string[];
  mediaUrl?: string;
}

const MSG91_API_URL = process.env.MSG91_API_URL || 'https://control.msg91.com';
const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID;
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

export const sendMessage = async ({
  mobileNumber,
  templateName,
  dynamicVariables = [],
}: SendMessageOptions): Promise<any> => {
  /** Send welcome message on whatsapp */
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
    console.log('🚀 ~ result:', result);
    return result;
  } catch (error: any) {
    console.error('Error sending message:', error);
    return { error: error.message };
  }
};
