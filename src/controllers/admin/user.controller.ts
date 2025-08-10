import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../constants';
import { userModel } from '../../models';
import { errorResponse, successResponse } from '../../utils/responseHandler';
import { deleteRequestModel } from '../../models/deleteRequest';
import { DeleteRequestStatusEnum } from '../../enums';
import { FileType, generateExportFile } from '../../utils/exportFile';

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

    console.log({ startDate, endDate, today });

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

export const exportUserReport = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { filter, fromDate, toDate, fileType } = req.query;
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

    const [data] = await userModel.aggregate([
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

    // interface BookingItem {
    //   [key: string]: any;
    //   startDateTime: Date | string;
    //   endDateTime: Date | string;
    // }

    // data.data = (data.data as BookingItem[]).map((item: BookingItem): BookingItem => {
    //   // Helper function to format date as dd-mm-yyyy
    //   const formatDate = (date: Date | string): string => {
    //     const d = new Date(date);
    //     const day = d.getDate().toString().padStart(2, '0');
    //     const month = (d.getMonth() + 1).toString().padStart(2, '0');
    //       const year = d.getFullYear();
    //       const hours = d.getHours().toString().padStart(2, '0');
    //       const minutes = d.getMinutes().toString().padStart(2, '0');
    //       const seconds = d.getSeconds().toString().padStart(2, '0');
    //     return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    //   };

    //   return {
    //     ...item,
    //     startDateTime: formatDate(item.startDateTime), // Format the startDateTime
    //     endDateTime: formatDate(item.endDateTime),     // Format the endDateTime
    //   };
    // });

    // const columns = [
    //   { header: 'Booking ID', key: 'bookingId', width: 35 },
    //   { header: 'User Name', key: 'userName', width: 25 },
    //   { header: 'Pet Name', key: 'petName', width: 20 },
    //   { header: 'Pet Type', key: 'petType', width: 20 },
    //   { header: 'Service Name', key: 'serviceName', width: 25 },
    //   { header: 'Service Item', key: 'serviceItemName', width: 25 },
    //   { header: 'Branch', key: 'branchName', width: 20 },
    //   { header: 'Start Date', key: 'startDate', width: 22 },
    //   { header: 'End Date', key: 'endDate', width: 22 },
    //   { header: 'Time Slot', key: 'timeSlotLabel', width: 20 },
    //   { header: 'Reason', key: 'appointmentReason', width: 30 },
    //   { header: 'Payment Id', key: 'providerOrderId', width: 30 },
    //   { header: 'Paid Amount', key: 'paidAmount', width: 20 },
    //   { header: 'Payment Status', key: 'bookingPaymentStatus', width: 20 },
    //   { header: 'Booking Status', key: 'bookingStatus', width: 20 }
    // ];

    // const rowsData = data.data.map((row: BookingItem) => ({
    //   bookingId: row._id?.toString() || '',
    //   userName: row.userName || '',
    //   petName: row.petName || '',
    //   petType: row.petType || '',
    //   serviceName: row.serviceName || '',
    //   serviceItemName: row.serviceItemName || '',
    //   branchName: row.branchName || '',
    //   startDate: row.startDateTime || '',
    //   endDate: row.endDateTime || '',
    //   timeSlotLabel: row.timeSlotLabel || '',
    //   appointmentReason: row.appointmentReason || '',
    //   providerOrderId: row.providerOrderId || '',
    //   paidAmount: row.paidAmount || '',
    //   bookingPaymentStatus: row.bookingPaymentStatus || '',
    //   bookingStatus: row.bookingStatus || ''
    // }));

    // const exportedData = await generateExportFile(rowsData, columns, fileType as FileType, res);
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