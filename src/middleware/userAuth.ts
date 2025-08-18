import { NextFunction, Response } from 'express';
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
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
    console.log({ decodedToken })
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
    // console.log("hsgdbjf sdb cfjdsbcsjfdbijbs", error);
    if (error instanceof TokenExpiredError) {
      return errorResponse(res, 'Unauthorized.', HTTP_STATUS.UNAUTHORIZED);
    }
    if (error instanceof JsonWebTokenError) {
      return errorResponse(res, 'Unauthorized.', HTTP_STATUS.UNAUTHORIZED);
    }
    console.log('Auth error:', error);
    
    return errorResponse(res, 'Internal Server Error');
  }
};
