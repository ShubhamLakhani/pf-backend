import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { HTTP_STATUS } from '../../constants';
import { consultationTypeEnum, UploadImageModuleEnum } from '../../enums';
import { deleteFile, uploadFile } from '../../helper/s3.helper';
import {
  bookingModel,
  consultationModel,
  inquiryModel,
  serviceItemsModel,
} from '../../models';
import { IServiceRecord, serviceRecordModel } from '../../models/servicRecord';
import { errorResponse, successResponse } from '../../utils/responseHandler';
import { validation } from '../../utils/validate';
import {
  queryMongoIdSchema,
  travelUpdateValidationSchema,
  vaccinationUpdateLastRecordValidationSchema,
} from '../../validations';
import { ITravel, travelModel } from '../../models/travel';
import { FileType, generateExportFile } from '../../utils/exportFile';

export const getBookingList = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const {
      userId,
      serviceId,
      serviceItemId,
      fromDate,
      toDate,
      branchId,
      petId,
    } = req.query;

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

    const [booking] = await bookingModel.aggregate([
      {
        $match: {
          ...(userId && {
            userId: new mongoose.Types.ObjectId(userId as string),
          }),
          ...(serviceId && {
            serviceId: new mongoose.Types.ObjectId(serviceId as string),
          }),
          ...(serviceItemId && {
            serviceItemId: new mongoose.Types.ObjectId(serviceItemId as string),
          }),
          ...(branchId && {
            branchId: new mongoose.Types.ObjectId(branchId as string),
          }),
          ...(petId && {
            petId: new mongoose.Types.ObjectId(petId as string),
          }),
          ...(startDate &&
            endDate && {
              startDateTime: { $gte: startDate },
              endDateTime: { $lte: endDate },
            }),
        },
      },
      {
        $lookup: {
          from: 'serviceitems',
          localField: 'serviceItemId',
          foreignField: '_id',
          as: 'serviceItems',
        },
      },
      {
        $lookup: {
          from: 'services',
          localField: 'serviceId',
          foreignField: '_id',
          as: 'service',
        },
      },
      {
        $lookup: {
          from: 'pets',
          localField: 'petId',
          foreignField: '_id',
          as: 'pet',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $lookup: {
          from: 'branches',
          localField: 'branchId',
          foreignField: '_id',
          as: 'branches',
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          serviceName: {
            $first: '$service.name',
          },
          serviceType: {
            $first: '$service.serviceType',
          },
          serviceItemName: {
            $first: '$serviceItems.name',
          },
          paidAmount: {
            $first: '$serviceItems.discountedAmount',
          },
          petName: {
            $first: '$pet.name',
          },
          petType: {
            $first: '$pet.petType',
          },
          userName: {
            $first: '$user.name',
          },
          startDateTime: 1,
          endDateTime: 1,
          appointmentReason: 1,
          userId: 1,
          bookingStatus: 1,
          bookingPaymentStatus: 1,
          timeSlotLabel: 1,
          providerOrderId: 1,
          petId: 1,
          branchName: {
            $first: '$branches.name',
          },
          branchId: 1,
        },
      },
      {
        $facet: {
          data: [{ $skip: skip }, ...(limit > 0 ? [{ $limit: limit }] : [])],  // Use dynamic pagination stage
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
      'Booking get successfully',
      booking,
      HTTP_STATUS.OK
    );
  } catch (error) {
    return errorResponse(res, 'Internal Server Error');
  }
};

export const exportBookingReport = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const {
      userId,
      serviceId,
      serviceItemId,
      fromDate,
      toDate,
      branchId,
      petId,
      fileType,
      ids
    } = req.query;

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

    const [booking] = await bookingModel.aggregate([
      {
        $match: {
          ...(userId && {
            userId: new mongoose.Types.ObjectId(userId as string),
          }),
          ...(serviceId && {
            serviceId: new mongoose.Types.ObjectId(serviceId as string),
          }),
          ...(serviceItemId && {
            serviceItemId: new mongoose.Types.ObjectId(serviceItemId as string),
          }),
          ...(branchId && {
            branchId: new mongoose.Types.ObjectId(branchId as string),
          }),
          ...(petId && {
            petId: new mongoose.Types.ObjectId(petId as string),
          }),
          ...(startDate && endDate && {
              startDateTime: { $gte: startDate },
              endDateTime: { $lte: endDate },
          }),
          ...(idList.length > 0 && {
            _id: { $in: idList.map(id => new mongoose.Types.ObjectId(id)) },
          }),
        },
      },
      {
        $lookup: {
          from: 'serviceitems',
          localField: 'serviceItemId',
          foreignField: '_id',
          as: 'serviceItems',
        },
      },
      {
        $lookup: {
          from: 'services',
          localField: 'serviceId',
          foreignField: '_id',
          as: 'service',
        },
      },
      {
        $lookup: {
          from: 'pets',
          localField: 'petId',
          foreignField: '_id',
          as: 'pet',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $lookup: {
          from: 'branches',
          localField: 'branchId',
          foreignField: '_id',
          as: 'branches',
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          serviceName: {
            $first: '$service.name',
          },
          serviceType: {
            $first: '$service.serviceType',
          },
          serviceItemName: {
            $first: '$serviceItems.name',
          },
          paidAmount: '$amount',
          petName: {
            $first: '$pet.name',
          },
          petType: {
            $first: '$pet.petType',
          },
          userName: {
            $first: '$user.name',
          },
          startDateTime: 1,
          endDateTime: 1,
          appointmentReason: 1,
          // userId: 1,
          bookingStatus: 1,
          bookingPaymentStatus: 1,
          timeSlotLabel: 1,
          providerOrderId: 1,
          // petId: 1,
          branchName: {
            $first: '$branches.name',
          },
          // branchId: 1,
          _id: 0
        },
      },
      {
        $facet: {
          data: [],  // Use dynamic pagination stage
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

    // if(isExport === 'true') {
      interface BookingItem {
        [key: string]: any;
        startDateTime: Date | string;
        endDateTime: Date | string;
      }

      booking.data = (booking.data as BookingItem[]).map((item: BookingItem): BookingItem => {
        // Helper function to format date as dd-mm-yyyy
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

        return {
          ...item,
          startDateTime: formatDate(item.startDateTime), // Format the startDateTime
          endDateTime: formatDate(item.endDateTime),     // Format the endDateTime
        };
      });

      const columns = [
        { header: 'Booking ID', key: 'bookingId', width: 35 },
        { header: 'User Name', key: 'userName', width: 25 },
        { header: 'Pet Name', key: 'petName', width: 20 },
        { header: 'Pet Type', key: 'petType', width: 20 },
        { header: 'Service Name', key: 'serviceName', width: 25 },
        { header: 'Service Item', key: 'serviceItemName', width: 25 },
        { header: 'Branch', key: 'branchName', width: 20 },
        { header: 'Start Date', key: 'startDate', width: 22 },
        { header: 'End Date', key: 'endDate', width: 22 },
        { header: 'Time Slot', key: 'timeSlotLabel', width: 20 },
        { header: 'Reason', key: 'appointmentReason', width: 30 },
        { header: 'Payment Id', key: 'providerOrderId', width: 30 },
        { header: 'Paid Amount', key: 'paidAmount', width: 20 },
        { header: 'Payment Status', key: 'bookingPaymentStatus', width: 20 },
        { header: 'Booking Status', key: 'bookingStatus', width: 20 }
      ];

      const rowsData = booking.data.map((row: BookingItem) => ({
        bookingId: row._id?.toString() || '',
        userName: row.userName || '',
        petName: row.petName || '',
        petType: row.petType || '',
        serviceName: row.serviceName || '',
        serviceItemName: row.serviceItemName || '',
        branchName: row.branchName || '',
        startDate: row.startDateTime || '',
        endDate: row.endDateTime || '',
        timeSlotLabel: row.timeSlotLabel || '',
        appointmentReason: row.appointmentReason || '',
        providerOrderId: row.providerOrderId || '',
        paidAmount: row.paidAmount || '',
        bookingPaymentStatus: row.bookingPaymentStatus || '',
        bookingStatus: row.bookingStatus || ''
      }));

      const exportedData = await generateExportFile(rowsData, columns, fileType as FileType, res);
      return
    // }


    // return successResponse(
    //   res,
    //   'Booking get successfully',
    //   booking,
    //   HTTP_STATUS.OK
    // );
  } catch (error) {
    return errorResponse(res, 'Internal Server Error');
  }
};

export const getConsultationList = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { userId, fromDate, toDate, type } = req.query;
    let { consultationType } = req.query;
    // consultationType = consultationType ?? consultationTypeEnum.normal;

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

    console.log({ type })

    const consultation = await consultationModel.aggregate([
      {
        $match: {
          ...(consultationType && {
            consultationType
          }),
          ...(userId && {
            userId: new mongoose.Types.ObjectId(userId as string),
          }),
          ...(startDate && endDate && {
              startDateTime: { $gte: startDate },
              endDateTime: { $lte: endDate },
          }),
          ...(type && typeof type === 'string' && {
            consultationType: { $in: JSON.parse(type as string).map((t: string) => t.trim()) }
          }),
        },
      },
      {
        $lookup: {
          from: 'pets',
          localField: 'petId',
          foreignField: '_id',
          as: 'pet',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          petName: {
            $first: '$pet.name',
          },
          petType: {
            $first: '$pet.petType',
          },
          userName: {
            $first: '$user.name',
          },
          paidAmount: '$amount',
          tDateTime: 1,
          startDateTime: 1,
          endDateTime: 1,
          appointmentReason: 1,
          userId: 1,
          paymentStatus: 1,
          providerOrderId: 1,
          consultationType: 1,
        },
      },
      // {
      //   $facet: {
      //     data: [{ $skip: skip }, ...(limit > 0 ? [{ $limit: limit }] : [])],
      //     totalCount: [{ $count: 'total' }],
      //   },
      // },
      // {
      //   $addFields: {
      //     totalCount: {
      //       $ifNull: [{ $first: '$totalCount.total' }, 0],
      //     },
      //   },
      // },
    ]);

    return successResponse(
      res,
      'Consultation list get successfully',
      {data: consultation},
      HTTP_STATUS.OK
    );
  } catch (error) {
    console.log('🚀 ~ error:', error);
    return errorResponse(res, 'Internal Server Error');
  }
};

export const exportConsultationList = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { userId, fromDate, toDate, type, fileType } = req.query;
    let { consultationType } = req.query;
    // consultationType = consultationType ?? consultationTypeEnum.normal;

    const limit = +(req.query?.limit ?? 10);
    const page = +(req.query?.page ?? 1);
    const skip: number = (page - 1) * limit;

    console.log({ type, fileType })

    let startDate,
      endDate = null;
    if (fromDate && toDate) {
      startDate = new Date(fromDate as string);
      startDate.setHours(0, 0, 0, 0); // Set to the start of the day (midnight)

      endDate = new Date(toDate as string);
      endDate.setHours(23, 59, 59, 999); // Set to the last millisecond of the day
    }

    const consultation = await consultationModel.aggregate([
      {
        $match: {
          ...(consultationType && {
            consultationType
          }),
          ...(userId && {
            userId: new mongoose.Types.ObjectId(userId as string),
          }),
          ...(startDate && endDate && {
              startDateTime: { $gte: startDate },
              endDateTime: { $lte: endDate },
          }),
          ...(type && typeof type === 'string' && {
            consultationType: { $in: JSON.parse(type as string).map((t: string) => t.trim()) }
          }),
        },
      },
      {
        $lookup: {
          from: 'pets',
          localField: 'petId',
          foreignField: '_id',
          as: 'pet',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          petName: {
            $first: '$pet.name',
          },
          petType: {
            $first: '$pet.petType',
          },
          userName: {
            $first: '$user.name',
          },
          paidAmount: '$amount',
          tDateTime: 1,
          startDateTime: 1,
          endDateTime: 1,
          appointmentReason: 1,
          userId: 1,
          paymentStatus: 1,
          providerOrderId: 1,
          consultationType: 1,
        },
      },
      // {
      //   $facet: {
      //     data: [{ $skip: skip }, ...(limit > 0 ? [{ $limit: limit }] : [])],
      //     totalCount: [{ $count: 'total' }],
      //   },
      // },
      // {
      //   $addFields: {
      //     totalCount: {
      //       $ifNull: [{ $first: '$totalCount.total' }, 0],
      //     },
      //   },
      // },
    ]);

    interface BookingItem {
        [key: string]: any;
        startDateTime: Date | string;
        endDateTime: Date | string;
      }

      const formattedConsultation = (consultation as BookingItem[]).map((item: BookingItem): BookingItem => {
        // Helper function to format date as dd-mm-yyyy
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

        return {
          ...item,
          startDateTime: formatDate(item.startDateTime), // Format the startDateTime
          endDateTime: formatDate(item.endDateTime),     // Format the endDateTime
        };
      });

      const columns = [
        { header: 'Booking ID', key: 'bookingId', width: 35 },
        { header: 'User Name', key: 'userName', width: 25 },
        { header: 'Pet Name', key: 'petName', width: 20 },
        { header: 'Pet Type', key: 'petType', width: 20 },
        { header: 'Service', key: 'service', width: 25 },
        { header: 'Start Date', key: 'startDate', width: 20 },
        { header: 'End Date', key: 'endDate', width: 20 },
        { header: 'Reason', key: 'reason', width: 25 },
        { header: 'Payment Id', key: 'paymentId', width: 30 },
        { header: 'Paid Amount', key: 'paidAmount', width: 20 },
        { header: 'Payment Status', key: 'paymentStatus', width: 20 }
      ]

      const rowsData = formattedConsultation.map(row => ({
          bookingId: row._id?.toString() || '',
          userName: row.userName || '',
          petName: row.petName || '',
          petType: row.petType || '',
          service: row.consultationType === 'Normal' ? 'Consultation' : row.consultationType || '',
          startDate: row.startDateTime || '',
          endDate: row.endDateTime || '',
          reason: row.reason || '',
          paymentId: row.providerOrderId || '',
          paidAmount: row.paidAmount || '',
          paymentStatus: row.paymentStatus || ''
        }));

      const exportedData = await generateExportFile(rowsData, columns, fileType as FileType, res);
      return

    // return successResponse(
    //   res,
    //   'Consultation list get successfully',
    //   {data: consultation},
    //   HTTP_STATUS.OK
    // );
  } catch (error) {
    return errorResponse(res, 'Internal Server Error');
  }
};

export const getInquiryList = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { fromDate, toDate } = req.query;

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

    const [inquiry] = await inquiryModel.aggregate([
      {
        $match: {
          ...(startDate &&
            endDate && {
              startDateTime: { $gte: startDate },
              endDateTime: { $lte: endDate },
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
      'Inquiry list get successfully',
      inquiry,
      HTTP_STATUS.OK
    );
  } catch (error) {
    return errorResponse(res, 'Internal Server Error');
  }
};

export const updateServiceRecordData = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { isValid, message, value } = validation<IServiceRecord>(
      req.body,
      vaccinationUpdateLastRecordValidationSchema
    );
    if (!isValid) {
      return errorResponse(res, message, HTTP_STATUS.BAD_REQUEST);
    }

    const checkServiceRecored = await serviceRecordModel.findById(value.id);
    if (!checkServiceRecored) {
      return errorResponse(
        res,
        'Service record invalid.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (value.serviceItemId === '') {
      value.serviceItemId = null;
    }
    if (value.serviceItemId) {
      const service = await serviceItemsModel.findOne({
        _id: value.serviceItemId,
        serviceId: value.serviceId,
      });

      if (!service) {
        return errorResponse(res, 'Service invalid.', HTTP_STATUS.BAD_REQUEST);
      }

      value.name = service.name;
    }

    if (req.file) {
      const image = await uploadFile(
        req.file,
        UploadImageModuleEnum.VACCINATION_RECORD,
        ''
      );
      if (!image.isValid) {
        return errorResponse(
          res,
          'Error uploading image',
          HTTP_STATUS.BAD_REQUEST
        );
      }
      value.image = image.fileName;
      if (checkServiceRecored.image) {
        await deleteFile(checkServiceRecored.image);
      }
    }

    const { id, ...rest } = value;
    await serviceRecordModel.updateOne({ _id: id }, rest);

    return successResponse(
      res,
      'Service record updated successfully',
      null,
      HTTP_STATUS.OK
    );
  } catch (error) {
    return errorResponse(res, 'Internal Server Error');
  }
};

export const getServiceRecordList = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { userId, serviceId, serviceItemId, fromDate, toDate, petId } =
      req.query;

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

    const [serviceRecord] = await serviceRecordModel.aggregate([
      {
        $match: {
          ...(userId && {
            userId: new mongoose.Types.ObjectId(userId as string),
          }),
          ...(serviceId && {
            serviceId: new mongoose.Types.ObjectId(serviceId as string),
          }),
          ...(serviceItemId && {
            serviceItemId: new mongoose.Types.ObjectId(serviceItemId as string),
          }),
          ...(petId && {
            petId: new mongoose.Types.ObjectId(petId as string),
          }),
          ...(startDate &&
            endDate && {
              lastDateTime: { $gte: startDate, $lte: endDate },
            }),
        },
      },
      {
        $lookup: {
          from: 'serviceitems',
          localField: 'serviceItemId',
          foreignField: '_id',
          as: 'serviceItems',
        },
      },
      {
        $lookup: {
          from: 'services',
          localField: 'serviceId',
          foreignField: '_id',
          as: 'service',
        },
      },
      {
        $lookup: {
          from: 'pets',
          localField: 'petId',
          foreignField: '_id',
          as: 'pet',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          serviceName: {
            $first: '$service.name',
          },
          serviceType: {
            $first: '$service.serviceType',
          },
          serviceItemName: {
            $first: '$serviceItems.name',
          },
          petName: {
            $first: '$pet.name',
          },
          petType: {
            $first: '$pet.petType',
          },
          userName: {
            $first: '$user.name',
          },
          lastDateTime: 1,
          image: 1,
          userId: 1,
          petId: 1,
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
      'Service record get successfully',
      serviceRecord,
      HTTP_STATUS.OK
    );
  } catch (error) {
    return errorResponse(res, 'Internal Server Error');
  }
};

export const getBookingDetails = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { isValid, message, value } = validation<{ id: string }>(
      req.params as any,
      queryMongoIdSchema
    );
    if (!isValid) {
      return errorResponse(res, message, HTTP_STATUS.BAD_REQUEST);
    }
    const { id } = value;

    const [bookingDetails] = await bookingModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: 'serviceitems',
          localField: 'serviceItemId',
          foreignField: '_id',
          as: 'serviceItems',
        },
      },
      {
        $lookup: {
          from: 'services',
          localField: 'serviceId',
          foreignField: '_id',
          as: 'service',
        },
      },
      {
        $lookup: {
          from: 'pets',
          localField: 'petId',
          foreignField: '_id',
          as: 'pet',
        },
      },
      {
        $lookup: {
          from: 'branches',
          localField: 'branchId',
          foreignField: '_id',
          as: 'branches',
        },
      },
      {
        $lookup: {
          from: 'servicerecords',
          localField: 'serviceRecordId',
          foreignField: '_id',
          as: 'servicerecords',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: {
          path: '$user',
        },
      },
      {
        $project: {
          serviceName: {
            $first: '$service.name',
          },
          serviceType: {
            $first: '$service.serviceType',
          },
          serviceItem: {
            $first: '$serviceItems',
          },
          petName: {
            $first: '$pet.name',
          },
          petType: {
            $first: '$pet.petType',
          },
          startDateTime: 1,
          endDateTime: 1,
          appointmentReason: 1,
          bookingStatus: 1,
          bookingPaymentStatus: 1,
          timeSlotLabel: 1,
          providerOrderId: 1,
          branchName: {
            $first: '$branches.name',
          },
          branchId: 1,
          userId: 1,
          servicerecords: {
            $first: '$servicerecords',
          },
          user: 1,
        },
      },
    ]);
    if (!bookingDetails) {
      return errorResponse(res, 'Booking not found', HTTP_STATUS.NOT_FOUND);
    }

    return successResponse(
      res,
      'Booking details get successfully',
      bookingDetails,
      HTTP_STATUS.OK
    );
  } catch (error) {
    console.log('🚀 ~ error:', error);
    return errorResponse(res, 'Internal Server Error');
  }
};

export const getTravelList = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { userId, petId, travelType } = req.query;

    const limit = +(req.query?.limit ?? 10);
    const page = +(req.query?.page ?? 1);
    const skip: number = (page - 1) * limit;

    const [travel] = await travelModel.aggregate([
      {
        $match: {
          ...(userId && {
            userId: new mongoose.Types.ObjectId(userId as string),
          }),
          ...(petId && {
            petId: new mongoose.Types.ObjectId(petId as string),
          }),
          ...(travelType && {
            travelType,
          }),
        },
      },
      {
        $lookup: {
          from: 'pets',
          localField: 'petId',
          foreignField: '_id',
          as: 'pet',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          petName: {
            $first: '$pet.name',
          },
          petType: {
            $first: '$pet.petType',
          },
          userName: {
            $first: '$user.name',
          },
          paidAmount: '$amount',
          travelType: 1,
          travelDate: 1,
          vaccinationRecord: 1,
          isFitToTravelCertificate: 1,
          isHealthCertificate: 1,
          isBloodTiterTest: 1,
          isNoObjectionCertificate: 1,
          requiredCertificates: 1,
          userId: 1,
          paymentStatus: 1,
          providerOrderId: 1,
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
      'Travel get successfully',
      travel,
      HTTP_STATUS.OK
    );
  } catch (error) {
    return errorResponse(res, 'Internal Server Error');
  }
};
export const exportTravelList = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { userId, petId, travelType, fileType } = req.query;

    const limit = +(req.query?.limit ?? 10);
    const page = +(req.query?.page ?? 1);
    const skip: number = (page - 1) * limit;

    const [travel] = await travelModel.aggregate([
      {
        $match: {
          ...(userId && {
            userId: new mongoose.Types.ObjectId(userId as string),
          }),
          ...(petId && {
            petId: new mongoose.Types.ObjectId(petId as string),
          }),
          ...(travelType && {
            travelType,
          }),
        },
      },
      {
        $lookup: {
          from: 'pets',
          localField: 'petId',
          foreignField: '_id',
          as: 'pet',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          petName: {
            $first: '$pet.name',
          },
          petType: {
            $first: '$pet.petType',
          },
          userName: {
            $first: '$user.name',
          },
          paidAmount: '$amount',
          travelType: 1,
          travelDate: 1,
          vaccinationRecord: 1,
          isFitToTravelCertificate: 1,
          isHealthCertificate: 1,
          isBloodTiterTest: 1,
          isNoObjectionCertificate: 1,
          requiredCertificates: 1,
          userId: 1,
          paymentStatus: 1,
          providerOrderId: 1,
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

    interface BookingItem {
        [key: string]: any;
        startDateTime: Date | string;
        endDateTime: Date | string;
      }

      const formattedConsultation = (travel as BookingItem[]).map((item: BookingItem): BookingItem => {
        // Helper function to format date as dd-mm-yyyy
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

        return {
          ...item,
          startDateTime: formatDate(item.startDateTime), // Format the startDateTime
          endDateTime: formatDate(item.endDateTime),     // Format the endDateTime
        };
      });

      const columns = [
        { header: 'Booking ID', key: 'bookingId', width: 35 },
        { header: 'User Name', key: 'userName', width: 25 },
        { header: 'Pet Name', key: 'petName', width: 20 },
        { header: 'Pet Type', key: 'petType', width: 20 },
        { header: 'Service', key: 'service', width: 25 },
        { header: 'Start Date', key: 'startDate', width: 20 },
        { header: 'End Date', key: 'endDate', width: 20 },
        { header: 'Reason', key: 'reason', width: 25 },
        { header: 'Payment Id', key: 'paymentId', width: 30 },
        { header: 'Payment Status', key: 'paymentStatus', width: 20 }
      ]

      const rowsData = formattedConsultation.map(row => ({
          bookingId: row._id?.toString() || '',
          userName: row.userName || '',
          petName: row.petName || '',
          petType: row.petType || '',
          service: row.consultationType === 'Normal' ? 'Consultation' : row.consultationType || '',
          startDate: row.startDateTime || '',
          endDate: row.endDateTime || '',
          reason: row.reason || '',
          paymentId: row.providerOrderId || '',
          paymentStatus: row.paymentStatus || ''
        }));

      const exportedData = await generateExportFile(rowsData, columns, fileType as FileType, res);
      return

    // return successResponse(
    //   res,
    //   'Travel get successfully',
    //   travel,
    //   HTTP_STATUS.OK
    // );
  } catch (error) {
    return errorResponse(res, 'Internal Server Error');
  }
};

export const getTravelDetails = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { isValid, message, value } = validation<{ id: string }>(
      req.params as any,
      queryMongoIdSchema
    );
    if (!isValid) {
      return errorResponse(res, message, HTTP_STATUS.BAD_REQUEST);
    }

    const { id } = value;

    const travel = await travelModel.findOne({
      _id: id,
    });

    if (!travel) {
      return errorResponse(res, 'Travel not found.', HTTP_STATUS.NOT_FOUND);
    }
    return successResponse(
      res,
      'Travel details get successfully',
      travel,
      HTTP_STATUS.OK
    );
  } catch (error) {
    return errorResponse(res, 'Internal Server Error');
  }
};

export const updateTravelCertificate = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { isValid, message, value } = validation<ITravel>(
      req.body,
      travelUpdateValidationSchema
    );
    if (!isValid) {
      return errorResponse(res, message, HTTP_STATUS.BAD_REQUEST);
    }

    const { _id, ...updateObj } = value;

    const checkTravel = await travelModel.findOne({
      _id,
    });
    if (!checkTravel) {
      return errorResponse(res, 'Travel not found.', HTTP_STATUS.NOT_FOUND);
    }

    if (req.file) {
      const image = await uploadFile(
        req.file,
        UploadImageModuleEnum.TRAVEL,
        ''
      );
      if (!image.isValid) {
        return errorResponse(
          res,
          'Error uploading image',
          HTTP_STATUS.BAD_REQUEST
        );
      }
      updateObj.travelCertificate = image.fileName;
      if (checkTravel.travelCertificate) {
        await deleteFile(checkTravel.travelCertificate);
      }
    } else {
      delete updateObj.travelCertificate;
    }

    await travelModel.updateOne({ _id }, updateObj);

    return successResponse(
      res,
      'Travel certificate updated successfully',
      null,
      HTTP_STATUS.OK
    );
  } catch (error) {
    return errorResponse(res, 'Internal Server Error');
  }
};
