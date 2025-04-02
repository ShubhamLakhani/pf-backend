import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

export const razorpayPayment = async (amount: number, notes: any = {}) => {
  const options = {
    amount: amount * 100,
    currency: 'INR',
    notes,
  };

  try {
    const response = await razorpay.orders.create(options);
    console.log('🚀 ~ razorpayPayment ~ response:', response);
    return response;
  } catch (error) {
    console.error('razorpay error', error);
    throw error;
  }
};
