import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { UploadImageModuleEnum } from '../enums';
import { sanitizeFileName } from './common.helper';

const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
dotenv.config({ path: envFile });

const s3 = new S3Client({
  region: process.env.AWS_REGION || '',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
  },
});

export const uploadFile = async (
  file: any,
  module: UploadImageModuleEnum,
  filePath: string = ''
) => {
  try {
    const fileName = `${uuidv4()}-EOF-${sanitizeFileName(file.originalname)}`;
    const uploadPath = `${module}${filePath}/${fileName}`;

    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: uploadPath,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const command = new PutObjectCommand(uploadParams);
    await s3.send(command);

    const publicUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadPath}`;

    return { isValid: true, fileName: publicUrl };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Function to extract the key from an S3 URL
const extractS3Key = (s3Url: string) => {
  try {
    const urlObj = new URL(s3Url);
    return urlObj.pathname.substring(1); // Remove leading '/'
  } catch (error) {
    console.error('Invalid URL:', error);
    throw error;
  }
};

export const deleteFile = async (s3Url: string) => {
  try {
    const filePath = extractS3Key(s3Url);

    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: filePath,
    };

    const command = new DeleteObjectCommand(deleteParams);
    await s3.send(command);

    return { isValid: true, message: 'File deleted successfully' };
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};
