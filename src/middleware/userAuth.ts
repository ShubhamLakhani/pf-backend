import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { HTTP_STATUS } from '../constants';
import { userModel } from '../models';
import { errorResponse } from '../utils/responseHandler';

export const userAuth = async (
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
    const userId = decodedToken?.userId;

    const valid = await userModel.findOne({
      _id: userId,
      isActive: true,
    });

    if (!valid) {
      return errorResponse(res, 'User not found.', HTTP_STATUS.NOT_FOUND);
    }

    res.locals.userId = userId;
    res.locals.user = valid;

    return next();
  } catch (error) {
    return errorResponse(res, 'Internal Server Error');
  }
};
