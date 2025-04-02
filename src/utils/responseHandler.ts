import { Response } from 'express';
import { HTTP_STATUS } from '../constants';

interface SuccessResponse {
  status: number;
  message: string;
  data?: any;
}

interface ErrorResponse {
  status: number;
  message: string;
}

// Success Response Handler
export const successResponse = (
  res: Response,
  message: string,
  data?: any,
  statusCode = HTTP_STATUS.OK
): Response => {
  const response: SuccessResponse = {
    status: statusCode,
    message,
    data,
  };
  return res.status(statusCode).json(response);
};

// Error Response Handler
export const errorResponse = (
  res: Response,
  message: string,
  statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR
): Response => {
  const response: ErrorResponse = {
    status: statusCode,
    message,
  };
  return res.status(statusCode).json(response);
};
