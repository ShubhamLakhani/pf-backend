import nodemailer from 'nodemailer';
import { IDeleteRequest } from '../models/deleteRequest';

const transporter = nodemailer.createTransport({
  service: 'gmail',  // Use any SMTP service (e.g., 'gmail', 'smtp.mailtrap.io', etc.)
  auth: {
    user: 'manju@petsfirsthospital.in',  // Your email address
    pass: 'vyyg gkgr yfak tviq',   // Your email password (use app password if using Gmail with 2FA)
  },
});

const contectUsHtml = ({ name, mobileNumber, email, address, serviceName }:any)=> `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Contact Us Submission</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 6px;">
      <tr>
        <td style="padding: 20px;">
          <h2 style="margin: 0 0 10px 0; color: #333333;text-align: center;">New Tap to Book submission</h2>

          <table width="100%" cellpadding="8" cellspacing="0" border="1" style="border-collapse: collapse; border-color: #dddddd; font-size: 14px; color: #333333;">
            <tr style="background-color: #f2f2f2;">
              <th align="left">Field</th>
              <th align="left">Value</th>
            </tr>
            <tr>
              <td><strong>Name</strong></td>
              <td>${name}</td>
            </tr>
            <tr>
              <td><strong>Phone Number</strong></td>
              <td>${mobileNumber}</td>
            </tr>
            <tr>
              <td><strong>Service</strong></td>
              <td>${serviceName}</td>
            </tr>
            <tr>
              <td><strong>Email</strong></td>
              <td>${email}</td>
            </tr>
            <tr>
              <td><strong>Address</strong></td>
              <td>${address}</td>
            </tr>
          </table>

          <p style="margin-top: 30px; font-size: 12px; color: #999999; text-align: center;">
            This message was generated from Pet First Health contact form.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

export const sendEmail = async (userData: any) => {

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: 'support@petsfirst.health',  // Admin's email address
    subject: 'Enquiry Form - Leads',
    html:contectUsHtml(userData),
  };

  try {
    const response = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', response.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
