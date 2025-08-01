import crypto from 'crypto';
import { BookingPaymentStatusEnum, consultationTypeEnum } from '../enums';
import {
  bookingModel,
  consultationModel,
  serviceModel,
  userModel,
} from '../models';
import { travelModel } from '../models/travel';
import { sendMessage } from '../helper/otp.helper';
import { whatsappTemplatesName } from '../constants';
import { formatDateTime, formatDateTimeForSMS } from '../helper/common.helper';

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
        const updatedData = await bookingModel.findOneAndUpdate(
          { providerOrderId: id },
          {
            $set: {
              providerOrderStatus: status,
              bookingPaymentStatus: BookingPaymentStatusEnum.success,
              providerData: req.body,
            },
          }
        );
        console.log('updatedData', updatedData?.userId);
        if (updatedData?.userId) {
          const user = await userModel.findById(updatedData.userId);
          if (user) {
            const service = await serviceModel.findById(updatedData.serviceId);

            const slug = service?.slug ?? whatsappTemplatesName.vaccinations;

            const { formattedDate, formattedTime } = formatDateTime(
              updatedData.startDateTime
            );
            const { formattedDateForSMS, formattedTimeForSMS } = formatDateTimeForSMS(
              updatedData.startDateTime
            );

            console.log({ formattedDateForSMS, formattedTimeForSMS })

            console.log('user', user);
            
            const serviceNameData: Record<"vaccinations" | "surgery" | "check-ups" | "hospital-visit" | "blood-tests", string> = {
              "vaccinations": "vaccination",
              "surgery": "surgery",
              "check-ups": "health checkup",
              "hospital-visit": "hospital visit",
              "blood-tests": "blood test",
            };
            const serviceSlug = service?.slug as keyof typeof serviceNameData | undefined;
            await sendMessage({
              mobileNumber: user.mobileNumber,
              templateName: whatsappTemplatesName[slug],
              dynamicVariables:
                slug === 'blood-tests' ? [] : [formattedDate, formattedTime],
              smsData: {
                serviceName: serviceSlug ? serviceNameData[serviceSlug] : serviceSlug,
                customerName: user.name,
                amount: updatedData.amount,
                date: formattedDateForSMS,
                time: formattedTimeForSMS
              }
            });
          }
        }
      } else if (notes.isConsultationBooking) {
        const updatedData = await consultationModel.findOneAndUpdate(
          { providerOrderId: id },
          {
            $set: {
              providerOrderStatus: status,
              paymentStatus: BookingPaymentStatusEnum.success,
              providerData: req.body,
            },
          },
          { new: true }
        );
        if (updatedData?.userId) {
          const user = await userModel.findById(updatedData.userId);
            console.log('user', user);

          if (user) {
            const { formattedDate, formattedTime } = formatDateTime(
              updatedData.startDateTime
            );

            const { formattedDateForSMS, formattedTimeForSMS } = formatDateTimeForSMS(
              updatedData.startDateTime
            );

            await sendMessage({
              mobileNumber: user.mobileNumber,
              templateName: whatsappTemplatesName[updatedData.consultationType],
              dynamicVariables: [formattedDate, formattedTime],
              smsData: {
                serviceName: updatedData.consultationType === consultationTypeEnum.normal ? "consultation" : "euthanasia",
                customerName: user.name,
                amount: updatedData.amount,
                date: formattedDateForSMS,
                time: formattedTimeForSMS
              }
            });
          }
        }
      } else if (notes.isTravelBooking) {
        const updatedData = await travelModel.findOneAndUpdate(
          { providerOrderId: id },
          {
            $set: {
              providerOrderStatus: status,
              paymentStatus: BookingPaymentStatusEnum.success,
              providerData: req.body,
            },
          },
          { new: true }
        );

        if (updatedData?.userId) {
          const user = await userModel.findById(updatedData.userId);
          console.log('user', user);
          const { formattedDateForSMS, formattedTimeForSMS } = formatDateTimeForSMS(
              updatedData.travelDate
            );
          if (user) {
            await sendMessage({
              mobileNumber: user.mobileNumber,
              templateName: whatsappTemplatesName.Travel,
              smsData: {
                serviceName: "travel",
                customerName: user.name,
                amount: updatedData.amount,
                date: formattedDateForSMS,
                time: formattedTimeForSMS
              }
            });
          }
        }
      }
    }
    return res.status(200).json({ success: true, message: 'Payment Verified' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid signature' });
  }
};
