import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../constants';
import { IAdmin } from '../../models';
import { branchModel } from '../../models/branch';
import { errorResponse, successResponse } from '../../utils/responseHandler';
import { validation } from '../../utils/validate';
import { branchSchema, paramMongoIdSchema } from '../../validations';

export const createBranch = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { isValid, message, value } = validation<IAdmin>(
      req.body,
      branchSchema
    );
    if (!isValid) {
      return errorResponse(res, message, HTTP_STATUS.BAD_REQUEST);
    }

    const { name } = value;

    const branch = await branchModel.findOne({ name });
    if (branch) {
      return errorResponse(
        res,
        'Branch already exists.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    await branchModel.create({ name });

    return successResponse(
      res,
      'Branch created successfully',
      null,
      HTTP_STATUS.CREATED
    );
  } catch (err) {
    return errorResponse(res, 'Internal Server Error');
  }
};

export const removeBranch = async (
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

    const branch = await branchModel.findById(id);
    if (!branch) {
      return errorResponse(
        res,
        'Branch data not found.',
        HTTP_STATUS.NOT_FOUND
      );
    }

    await branchModel.deleteOne({ _id: id });

    return successResponse(
      res,
      'Branch deleted successfully',
      null,
      HTTP_STATUS.OK
    );
  } catch (err) {
    return errorResponse(res, 'Internal Server Error');
  }
};

export const getBranchList = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { filter } = req.query;
    const limit = +(req.query?.limit ?? 10);
    const page = +(req.query?.page ?? 1);
    const skip: number = (page - 1) * limit;

    const [data] = await branchModel.aggregate([
      {
        $match: {
          ...(filter && {
            name: { $regex: new RegExp(filter as string, 'i') },
          }),
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          data: [{ $skip: skip }, ...(limit > 0 ? [{ $limit: limit }] : [])],
          totalCount: [{ $count: 'total' }],
        },
      },
      {
        $addFields: {
          totalCount: {
            $ifNull: [{ $first: '$totalCount.total' }, 0],
          },
        },
      },
    ]);

    return successResponse(
      res,
      'Branch get successfully',
      data,
      HTTP_STATUS.OK
    );
  } catch (err) {
    return errorResponse(res, 'Internal Server Error');
  }
};
