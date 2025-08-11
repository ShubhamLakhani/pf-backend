import { Request, Response } from "express";
import { deleteRequestModel } from "../../models/deleteRequest";
import { errorResponse, successResponse } from "../../utils/responseHandler";
import { HTTP_STATUS } from "../../constants";
import { contactUsModel } from "../../models/contactUs";

export const getDeleteRequestList = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { filter } = req.query;
    const limit = +(req.query?.limit ?? 10);
    const page = +(req.query?.page ?? 1);
    const skip: number = (page - 1) * limit;

    const [data] = await deleteRequestModel.aggregate([
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
      'Delete Request get successfully',
      data,
      HTTP_STATUS.OK
    );
  } catch (err) {
    return errorResponse(res, 'Internal Server Error');
  }
};

export const getContactUsList = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { filter } = req.query;
    const limit = +(req.query?.limit ?? 10);
    const page = +(req.query?.page ?? 1);
    const skip: number = (page - 1) * limit;

    const [data] = await contactUsModel.aggregate([
      {
        $match: {
          ...(filter && {
            name: { $regex: new RegExp(filter as string, 'i') },
          }),
        },
      },
      {
        $lookup: {
          from: 'services',
          localField: 'serviceId',
          foreignField: '_id',
          as: 'serviceDetails',
        },
      },
      {
        $addFields: {
          serviceName: { $arrayElemAt: ['$serviceDetails.name', 0] },
        },
      },
      {
        $project: {
          serviceDetails: 0, // Exclude serviceDetails field
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
      'Contact Us Request get successfully',
      data,
      HTTP_STATUS.OK
    );
  } catch (err) {
    return errorResponse(res, 'Internal Server Error');
  }
};
