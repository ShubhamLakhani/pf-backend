import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../constants';
import { userModel } from '../../models';
import { errorResponse, successResponse } from '../../utils/responseHandler';
import { deleteRequestModel } from '../../models/deleteRequest';
import { DeleteRequestStatusEnum } from '../../enums';
import { FileType, generateExportFile } from '../../utils/exportFile';
import mongoose from 'mongoose';

export const getAllUserList = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { filter, fromDate, toDate } = req.query;
    const limit = +(req.query?.limit ?? 10);
    const page = +(req.query?.page ?? 1);
    const skip: number = (page - 1) * limit;

    let startDate,
      endDate = null;
    if (fromDate && toDate) {
      startDate = new Date(fromDate as string);
      startDate.setHours(0, 0, 0, 0); // Set to the start of the day (midnight)

      endDate = new Date(toDate as string);
      endDate.setHours(23, 59, 59, 999); // Set to the last millisecond of the day
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const data = await userModel.aggregate([
      {
        $match: {
          ...(startDate &&
              endDate && {
                createdAt: { $gte: startDate, $lte: endDate }, 
              }),
        }
      },
      ...(filter
        ? [
            {
              $match: {
                $or: [
                  { name: { $regex: new RegExp(filter as string, 'i') } },
                  { mobileNumber: { $regex: new RegExp(filter as string, 'i') } },
                  { alternateMobileNumber: { $regex: new RegExp(filter as string, 'i') } }
                ],
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

export const exportUserReport = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { filter, fromDate, toDate, fileType, ids } = req.query;
    const limit = +(req.query?.limit ?? 10);
    const page = +(req.query?.page ?? 1);
    const skip: number = (page - 1) * limit;

    let startDate,
      endDate = null;
    if (fromDate && toDate) {
      startDate = new Date(fromDate as string);
      startDate.setHours(0, 0, 0, 0); // Set to the start of the day (midnight)

      endDate = new Date(toDate as string);
      endDate.setHours(23, 59, 59, 999); // Set to the last millisecond of the day
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let idList: string[] = [];
    
    if (ids) {
      try {
        const parsed = JSON.parse(ids as string);
        if (Array.isArray(parsed)) {
          idList = parsed;
        }
      } catch (error) {
        console.error("Invalid ids query param format:", error);
        return errorResponse(res, 'Invalid format for ids. Must be a JSON stringified array.');
      }
    }

    const [data] = await userModel.aggregate([
      {
        $match: {
          ...(startDate &&
              endDate && {
                createdAt: { $gte: startDate, $lte: endDate },  
              }),
          ...(idList.length > 0 && {
              _id: { $in: idList.map(id => new mongoose.Types.ObjectId(id)) },
            }),
        }
      },
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

    console.log({ data: JSON.stringify(data) });

    interface UserItem {
      [key: string]: any;
      _id: string;
      mobileNumber: string;
      isActive: boolean;
      alternateMobileNumber?: string | null;
      createdAt: Date | string;
      updatedAt: Date | string;
      address?: string;
      name?: string;
      isNew?: boolean;
      profileImage?: string;
    }

    // Helper function to format date as dd-mm-yyyy HH:MM:SS
    const formatDate = (date: Date | string): string => {
      const d = new Date(date);
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const year = d.getFullYear();
      const hours = d.getHours().toString().padStart(2, '0');
      const minutes = d.getMinutes().toString().padStart(2, '0');
      const seconds = d.getSeconds().toString().padStart(2, '0');
      return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    };

    data.data = (data.data as UserItem[]).map((item: UserItem): UserItem => ({
      ...item,
      createdAt: formatDate(item.createdAt),
      updatedAt: formatDate(item.updatedAt),
    }));

    const columns = [
      { header: 'User ID', key: '_id', width: 35 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Mobile Number', key: 'mobileNumber', width: 20 },
      { header: 'Alternate Mobile Number', key: 'alternateMobileNumber', width: 20 },
      { header: 'Is Active', key: 'isActive', width: 10 },
      { header: 'Address', key: 'address', width: 30 },
      { header: 'Created At', key: 'createdAt', width: 22 },
      { header: 'Updated At', key: 'updatedAt', width: 22 },
      { header: 'Is New', key: 'isNew', width: 10 },
      { header: 'Profile Image', key: 'profileImage', width: 40 }
    ];

    const rowsData = data.data.map((row: UserItem) => ({
      _id: row._id || '',
      name: row.name || '',
      mobileNumber: row.mobileNumber || '',
      alternateMobileNumber: row.alternateMobileNumber || '',
      isActive: row.isActive ? 'Yes' : 'No',
      address: row.address || '',
      createdAt: row.createdAt || '',
      updatedAt: row.updatedAt || '',
      isNew: row.isNew ? 'Yes' : 'No',
      profileImage: row.profileImage || '',
    }));

    await generateExportFile(rowsData, columns, fileType as FileType, res, "User");
    return

    // return successResponse(
    //   res,
    //   'User get successfully',
    //   data?.[0],
    //   HTTP_STATUS.OK
    // );
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