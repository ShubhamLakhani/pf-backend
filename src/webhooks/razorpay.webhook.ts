import crypto from 'crypto';
import { BookingPaymentStatusEnum } from '../enums';
import { bookingModel, consultationModel } from '../models';

export const razorpayWebhook = async (req: any, res: any) => {
  console.log('Razorpay Webhook Received');
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
  const signature = req.headers['x-razorpay-signature'];

  // Compute HMAC SHA256 to verify signature
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(req.body));
  const expectedSignature = hmac.digest('hex');

  if (signature === expectedSignature) {
    console.log('Webhook Verified:', JSON.stringify(req.body));
    const { event } = req.body;
    if (event === 'order.paid') {
      const { id, status, notes } = req.body.payload.order.entity;

      if (notes.isBooking) {
        await bookingModel.updateOne(
          { providerOrderId: id },
          {
            $set: {
              providerOrderStatus: status,
              bookingPaymentStatus: BookingPaymentStatusEnum.success,
              providerData: req.body,
            },
          }
        );
      } else if (notes.isConsultationBooking) {
        await consultationModel.updateOne(
          { providerOrderId: id },
          {
            $set: {
              providerOrderStatus: status,
              paymentStatus: BookingPaymentStatusEnum.success,
              providerData: req.body,
            },
          }
        );
      }
    }
    return res.status(200).json({ success: true, message: 'Payment Verified' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid signature' });
  }
};
