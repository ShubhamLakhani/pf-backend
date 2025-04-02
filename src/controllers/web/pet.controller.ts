import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../constants';
import { UploadImageModuleEnum } from '../../enums';
import { toSlug } from '../../helper/common.helper';
import { deleteFile, uploadFile } from '../../helper/s3.helper';
import { IPet, petModel } from '../../models';
import { errorResponse, successResponse } from '../../utils/responseHandler';
import { validation } from '../../utils/validate';
import {
  paramMongoIdSchema,
  petUpdateValidationSchema,
  petValidationSchema,
} from '../../validations';

export const createPet = async (req: Request, res: Response): Promise<any> => {
  try {
    const { isValid, message, value } = validation<IPet>(
      req.body,
      petValidationSchema
    );
    console.log('🚀 ~ createPet ~ value:', value);
    if (!isValid) {
      return errorResponse(res, message, HTTP_STATUS.BAD_REQUEST);
    }

    const image = await uploadFile(req.file, UploadImageModuleEnum.PET, '');
    if (!image.isValid) {
      return errorResponse(
        res,
        'Error uploading image',
        HTTP_STATUS.BAD_REQUEST
      );
    }
    value.image = image.fileName;
    value.userId = res.locals.userId;
    value.slug = toSlug(value.name, true);

    const pet = await petModel.create(value);

    return successResponse(
      res,
      'Pet created successfully',
      pet,
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    return errorResponse(res, 'Internal Server Error');
  }
};

export const updatePet = async (req: Request, res: Response): Promise<any> => {
  try {
    const { isValid, message, value } = validation<IPet>(
      req.body,
      petUpdateValidationSchema
    );
    if (!isValid) {
      return errorResponse(res, message, HTTP_STATUS.BAD_REQUEST);
    }

    const { id, ...updateObj } = value;

    const checkPet = await petModel.findOne({
      _id: id,
      userId: res.locals.userId,
    });

    if (!checkPet) {
      return errorResponse(res, 'Pet data not found.', HTTP_STATUS.NOT_FOUND);
    }

    if (req.file) {
      const image = await uploadFile(req.file, UploadImageModuleEnum.PET, '');
      if (!image.isValid) {
        return errorResponse(
          res,
          'Error uploading image',
          HTTP_STATUS.BAD_REQUEST
        );
      }
      updateObj.image = image.fileName;
      if (checkPet.image) {
        await deleteFile(checkPet.image);
      }
    } else {
      delete updateObj.image;
    }

    if (updateObj.name) {
      updateObj.slug = toSlug(updateObj.name, true);
    }

    await petModel.updateOne({ _id: value.id }, updateObj);

    return successResponse(
      res,
      'Pet updated successfully',
      null,
      HTTP_STATUS.OK
    );
  } catch (error) {
    return errorResponse(res, 'Internal Server Error');
  }
};

export const getPetDetails = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { isValid, message, value } = validation<{ id: string }>(
      req.params as any,
      paramMongoIdSchema
    );
    if (!isValid) {
      return errorResponse(res, message, HTTP_STATUS.BAD_REQUEST);
    }

    const { id } = value;

    const pet = await petModel.findOne({
      _id: id,
      userId: res.locals.userId,
    });

    if (!pet) {
      return errorResponse(res, 'Pet data not found.', HTTP_STATUS.NOT_FOUND);
    }

    return successResponse(
      res,
      'Pet detail get successfully',
      pet,
      HTTP_STATUS.OK
    );
  } catch (error) {
    return errorResponse(res, 'Internal Server Error');
  }
};

export const getPetList = async (req: Request, res: Response): Promise<any> => {
  try {
    const { filter, petType } = req.query;

    const pet = await petModel
      .find({
        userId: res.locals.userId,
        ...(petType && { petType }),
        ...(filter && { name: { $regex: new RegExp(filter as string, 'i') } }),
      })
      .sort({ createdAt: -1 });

    if (!pet.length) {
      return successResponse(res, 'Pets get successfully', [], HTTP_STATUS.OK);
    }

    return successResponse(res, 'Pets get successfully', pet, HTTP_STATUS.OK);
  } catch (error) {
    return errorResponse(res, 'Internal Server Error');
  }
};

export const deletePet = async (req: Request, res: Response): Promise<any> => {
  try {
    const { isValid, message, value } = validation<{ id: string }>(
      req.params as any,
      paramMongoIdSchema
    );
    if (!isValid) {
      return errorResponse(res, message, HTTP_STATUS.BAD_REQUEST);
    }

    const { id } = value;

    const pet = await petModel.findOne({
      _id: id,
      userId: res.locals.userId,
    });

    if (!pet) {
      return errorResponse(res, 'Pet data not found.', HTTP_STATUS.NOT_FOUND);
    }

    await petModel.deleteOne({ _id: id });

    return successResponse(
      res,
      'Pet deleted successfully',
      null,
      HTTP_STATUS.OK
    );
  } catch (error) {
    return errorResponse(res, 'Internal Server Error');
  }
};
