import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { OtpWithExpiry } from '../utils/common.interface';
import { serviceItemsModel } from '../models';

export const generateOtp = (): number => randomInt(1000, 10000);

export const generateOtpWithExpiry = (): OtpWithExpiry => {
  const otp = generateOtp();

  // Set expiration time (5 minutes from now)
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  return { otp, expiresAt };
};

export const generateAccessToken = (userId: string) =>
  jwt.sign({ userId }, process.env.JWT_SECRET || 'dev-secret', {
    expiresIn: process.env.JWT_EXPIRY || '1h',
  });

export const sanitizeFileName = (filename: string): string =>
  filename.replace(/[/\s]+/g, '-');

export const fileUpload = async (
  file: any
): Promise<{ isValid: boolean; fileName: string }> => {
  const fileName = `${uuidv4()}-EOF-${sanitizeFileName(file.originalname)}`;
  const uploadDir = path.join(__dirname, '../../', 'assets/uploads');
  const filePath = path.join(uploadDir, fileName);

  try {
    // Create the 'uploads' folder if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      await fs.promises.mkdir(uploadDir, { recursive: true });
    }

    // Write the file buffer to disk
    await fs.promises.writeFile(filePath, file.buffer);

    return { isValid: true, fileName };
  } catch (err) {
    console.error('Error writing file:', err);
    return { isValid: false, fileName: '' };
  }
};

export const comparePasswords = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    return false;
  }
};

export const hashPassword = async (password: string): Promise<string> => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    throw new Error('Error generating password');
  }
};

export const toSlug = (str: string, useUuid: boolean = false): string => {
  let slug = str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/-+/g, '-'); // Remove consecutive dashes

  return useUuid ? `${slug}-${uuidv4()}` : slug;
};

export const generateUniqueSlug = async (name: string, id = null) => {
  let slug = toSlug(name);
  let uniqueSlug = slug;

  const query: Record<string, any> = {};
  if (id) {
    query._id = { $ne: id };
  }

  for (let counter = 1; ; counter++) {
    query.slug = uniqueSlug;

    const existing = await serviceItemsModel.findOne(query);
    if (!existing) break;

    uniqueSlug = `${slug}-${counter}`;
  }

  return uniqueSlug;
};

// Utility function to format date and time
export const formatDateTime = (dateString: Date) => {
  const date = new Date(dateString);
  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Kolkata',
  }).format(date);

  // Format time in IST
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  }).format(date);

  return { formattedDate, formattedTime };
};
// Utility function to format date and time for SMS
export const formatDateTimeForSMS = (dateString: Date) => {
  const date = new Date(dateString);

  // Format day with suffix (st, nd, rd, th)
  const day = date.getUTCDate();
  interface SuffixFunction {
    (day: number): string;
  }

  const suffix: SuffixFunction = (day: number): string => {
    if (day > 3 && day < 21) return 'th'; // For 11th to 13th
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };
  const formattedDateForSMS = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(date);

const dayWithSuffix = formattedDateForSMS.replace(
    /^(\d{1,2})/,
    (d) => `${d}${suffix(Number(d))}`
  );


  // Format time in 12-hour format
  const formattedTimeForSMS = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  }).format(date);


  return { formattedDateForSMS: dayWithSuffix, formattedTimeForSMS };

};
