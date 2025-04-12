import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { OtpWithExpiry } from '../utils/common.interface';
import { serviceItemsModel } from '../models';

export const generateOtp = (): number => randomInt(100000, 1000000);

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