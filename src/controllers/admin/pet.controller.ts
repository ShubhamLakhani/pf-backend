import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { HTTP_STATUS } from '../../constants';
import { petModel } from '../../models';
import { errorResponse, successResponse } from '../../utils/responseHandler';

export const getAllPetList = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { filter, petType, userId } = req.query;
    const limit = +(req.query?.limit ?? 10);
    const page = +(req.query?.page ?? 1);
    const skip: number = (page - 1) * limit;

    const data = await petModel.aggregate([
      {
        $match: {
          ...(userId && {
            userId: new mongoose.Types.ObjectId(userId as string),
          }),
          ...(petType && { petType }),
          ...(filter && {
            name: { $regex: new RegExp(filter as string, 'i') },
          }),
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          otp: 0,
          otpExpiry: 0,
        },
      },
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
      'Pet get successfully',
      data?.[0],
      HTTP_STATUS.OK
    );
  } catch (err) {
    return errorResponse(res, 'Internal Server Error');
  }
};
