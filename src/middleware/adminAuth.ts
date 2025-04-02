import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { HTTP_STATUS } from '../constants';
import { adminModel } from '../models';
import { errorResponse } from '../utils/responseHandler';

export const adminAuth = async (
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
    const adminId = decodedToken?.userId;

    const valid = await adminModel.findById(adminId);

    if (!valid) {
      return errorResponse(res, 'Admin not found.', HTTP_STATUS.NOT_FOUND);
    }

    res.locals.adminId = adminId;

    return next();
  } catch (error) {
    return errorResponse(res, 'Internal Server Error');
  }
};
