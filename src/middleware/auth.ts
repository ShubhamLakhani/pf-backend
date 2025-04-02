import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/responseHandler';

export const commonAuth = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return errorResponse(res, 'Token not found.');
    }
    const decodedToken: any = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );

    if (!decodedToken) {
      throw new Error();
    }

    return next();
  } catch (error) {
    return errorResponse(res, 'Internal Server Error');
  }
};
