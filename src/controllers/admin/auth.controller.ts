import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../constants';
import {
  comparePasswords,
  generateAccessToken,
} from '../../helper/common.helper';
import { adminModel, IAdmin } from '../../models';
import { errorResponse, successResponse } from '../../utils/responseHandler';
import { validation } from '../../utils/validate';
import { adminSignInSchema } from '../../validations';

export const signIn = async (req: Request, res: Response): Promise<any> => {
  try {
    const { isValid, message, value } = validation<IAdmin>(
      req.body,
      adminSignInSchema
    );
    if (!isValid) {
      return errorResponse(res, message, HTTP_STATUS.BAD_REQUEST);
    }

    const { email, password } = value;

    const admin = await adminModel.findOne({ email });
    if (!admin) {
      return errorResponse(res, 'Admin not found.', HTTP_STATUS.NOT_FOUND);
    }

    const comparePassword = await comparePasswords(password, admin.password);
    if (!comparePassword) {
      return errorResponse(res, 'Invalid credential.', HTTP_STATUS.BAD_REQUEST);
    }

    const token = generateAccessToken(admin._id);

    return successResponse(
      res,
      'Admin signed in successfully',
      {
        name: admin.name,
        token,
      },
      HTTP_STATUS.CREATED
    );
  } catch (err) {
    return errorResponse(res, 'Internal Server Error');
  }
};
