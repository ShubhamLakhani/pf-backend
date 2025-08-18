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
    expiresIn: 1,
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
  const formattedDate = date.toISOString().split('T')[0];
  const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
  });
  return { formattedDate, formattedTime };
};
// Utility function to format date and time for SMS
export const formatDateTimeForSMS = (dateString: Date) => {
  const date = new Date(dateString);

  // Format day with suffix (st, nd, rd, th)
  const day = date.getDate();
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
  const formattedDateForSMS = `${day}${suffix(day)} ${date.toLocaleString('en-US', { month: 'long' })} ${date.getFullYear()}`;

  // Format time in 12-hour format
  const formattedTimeForSMS = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return { formattedDateForSMS, formattedTimeForSMS };
};
