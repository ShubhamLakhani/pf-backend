import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../constants';
import { deleteRequestModel, IDeleteRequest } from '../../models/deleteRequest';
import { errorResponse, successResponse } from '../../utils/responseHandler';
import { validation } from '../../utils/validate';
import { contactUsValidationSchema, deleteRequestValidationSchema } from '../../validations';
import { contactUsModel } from '../../models/contactUs';

export const createDeleteRequest = async (req: Request, res: Response): Promise<any> => {
  try {
    const { isValid, message, value } = validation<IDeleteRequest>(
      req.body,
      deleteRequestValidationSchema
    );
    
    if (!isValid) {
      return errorResponse(res, message, HTTP_STATUS.BAD_REQUEST);
    }

    await deleteRequestModel.create(value);

    return successResponse(
      res,
      'Delete Request created successfully',
      null,
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    return errorResponse(res, 'Internal Server Error');
  }
};
export const createContactUsRequest = async (req: Request, res: Response): Promise<any> => {
  try {
    const { isValid, message, value } = validation<IDeleteRequest>(
      req.body,
      contactUsValidationSchema
    );
    
    if (!isValid) {
      return errorResponse(res, message, HTTP_STATUS.BAD_REQUEST);
    }

    await contactUsModel.create(value);

    return successResponse(
      res,
      'Contact Us Request created successfully',
      null,
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    return errorResponse(res, 'Internal Server Error');
  }
};