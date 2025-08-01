import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../constants';
import { userModel } from '../../models';
import { errorResponse, successResponse } from '../../utils/responseHandler';
import { deleteRequestModel } from '../../models/deleteRequest';
import { DeleteRequestStatusEnum } from '../../enums';

export const getAllUserList = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { filter } = req.query;
    const limit = +(req.query?.limit ?? 10);
    const page = +(req.query?.page ?? 1);
    const skip: number = (page - 1) * limit;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const data = await userModel.aggregate([
      ...(filter
        ? [
            {
              $match: {
                name: { $regex: new RegExp(filter as string, 'i') },
              },
            },
          ]
        : []),
      { $sort: { createdAt: -1 } },
      {
        $addFields: {
          isNew: {
            $cond: {
              if: {
                $eq: [
                  {
                    $dateToString: {
                      format: '%Y-%m-%d',
                      date: '$createdAt',
                      timezone: 'Asia/Kolkata', // Use your timezone here
                    },
                  },
                  today.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }), // ensures 'YYYY-MM-DD'
                ],
              },
              then: true,
              else: false,
            },
          },
        },
      },
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
      'User get successfully',
      data?.[0],
      HTTP_STATUS.OK
    );
  } catch (err) {
    return errorResponse(res, 'Internal Server Error');
  }
};

export const getUserDetails = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { userId } = req.params;

    const data = await userModel.findById(userId, { otp: 0, otpExpiry: 0 });

    return successResponse(
      res,
      'User details get successfully',
      data,
      HTTP_STATUS.OK
    );
  } catch (err) {
    return errorResponse(res, 'Internal Server Error');
  }
};
export const changeUserStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const {userId} = req.params;

    const user = await userModel.findById(userId);
    if (!user) {
      return errorResponse(res, 'User not found.', HTTP_STATUS.NOT_FOUND);
    }

    await userModel.updateOne({_id: userId}, {$set: {isActive: !user.isActive}});
    if(user.isActive) {
      await deleteRequestModel.updateMany({mobileNumber: user.mobileNumber}, {$set: {status: DeleteRequestStatusEnum.accepted}});
    }
    
    return successResponse(
      res,
      'User status updated successfully',
      {
        userId: user._id,
        isActive: !user.isActive,
      },
      HTTP_STATUS.OK
    );
  } catch (err) {
    return errorResponse(res, 'Internal Server Error');
  }
};