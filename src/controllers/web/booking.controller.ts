import { Request, Response } from 'express';
import mongoose from 'mongoose';
import {
  HTTP_STATUS,
  serviceConsultationEuthanasiaPriceObj,
  serviceConsultationPriceObj,
} from '../../constants';
import {
  ConsultationStatusEnum,
  consultationTypeEnum,
  UploadImageModuleEnum,
} from '../../enums';
import { razorpayPayment } from '../../helper/razorpay.helper';
import { deleteFile, uploadFile } from '../../helper/s3.helper';
import {
  bookingModel,
  consultationModel,
  IBooking,
  IConsultation,
  IInquiry,
  inquiryModel,
  serviceItemsModel,
  serviceModel,
} from '../../models';
import { branchModel } from '../../models/branch';
import { IServiceRecord, serviceRecordModel } from '../../models/servicRecord';
import { ICreateBooking } from '../../types/booking.type';
import { errorResponse, successResponse } from '../../utils/responseHandler';
import { validation } from '../../utils/validate';
import {
  bookingValidationSchema,
  consultationBookingValidationSchema,
  consultationUpdateValidationSchema,
  queryMongoIdSchema,
  signUpSchema,
  travelBookingValidationSchema,
  vaccinationLastRecordValidationSchema,
  vaccinationUpdateLastRecordValidationSchema,
} from '../../validations';
import { ITravel, travelModel } from '../../models/travel';

export const createBooking = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { isValid, message, value } = validation<IBooking>(
      req.body,
      bookingValidationSchema
    );
    if (!isValid) {
      return errorResponse(res, message, HTTP_STATUS.BAD_REQUEST);
    }

    if (value.branchId) {
      const checkBranch = await branchModel.findById(value.branchId);
      if (!checkBranch) {
        return errorResponse(res, 'Branch not found.', HTTP_STATUS.NOT_FOUND);
      }
    }
    let serviceItem;
    if (value.serviceItemId) {
      const [data] = await serviceItemsModel.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(value.serviceItemId) } },
        {
          $lookup: {
            from: 'services',
            localField: 'serviceId',
            foreignField: '_id',
            as: 'result',
          },
        },
        {
          $project: {
            serviceId: 1,
            name: 1,
            amount: 1,
            discountedAmount: 1,
            serviceName: {
              $first: '$result.name',
            },
            serviceType: {
              $first: '$result.serviceType',
            },
          },
        },
      ]);

      if (!data) {
        return errorResponse(
          res,
          'Service item data not found.',
          HTTP_STATUS.NOT_FOUND
        );
      }
      serviceItem = data;
    } else {
      const service = await serviceModel.findOne({
        _id: value.serviceId,
        slug: { $ne: 'travel' },
      });
      if (!service) {
        return errorResponse(
          res,
          'Service data not found.',
          HTTP_STATUS.NOT_FOUND
        );
      }
      serviceItem = {
        serviceId: service._id,
        name: service.name,
        amount: service.amount ?? 0,
        discountedAmount: service.discountedAmount ?? 0,
        serviceName: service.name,
        serviceType: service.serviceType,
      };
    }

    console.log('🚀 ~ serviceItem:', serviceItem);
    const checkBooking = isValidBookingSlot(serviceItem, value);
    if (!checkBooking) {
      return errorResponse(res, 'Booking time invalid.', HTTP_STATUS.NOT_FOUND);
    }

    value.serviceId = serviceItem.serviceId;
    value.userId = res.locals.userId;

    const amount = serviceItem.discountedAmount;
    const razorpayOrder = await razorpayPayment(amount, { isBooking: true });

    const serviceRecord = await serviceRecordModel.create({
      serviceId: value.serviceId,
      serviceItemId: value.serviceItemId ?? null,
      petId: value.petId,
      userId: value.userId,
      name: serviceItem.name,
    });

    value.serviceRecordId = serviceRecord._id;
    value.providerOrderId = razorpayOrder.id;
    value.amount = amount;

    await bookingModel.create(value);

    return successResponse(
      res,
      'Booking created successfully',
      {
        providerOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    return errorResponse(res, 'Internal Server Error');
  }
};

export const getBookingList = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { serviceId, serviceItemId, fromDate, toDate, branchId, petId } =
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

    const [booking] = await bookingModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(res.locals.userId as string),
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
      'Booking get successfully',
      booking,
      HTTP_STATUS.OK
    );
  } catch (error) {
    return errorResponse(res, 'Internal Server Error');
  }
};

export const createInquiry = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { isValid, message, value } = validation<IInquiry>(
      req.body,
      signUpSchema
    );
    if (!isValid) {
      return errorResponse(res, message, HTTP_STATUS.BAD_REQUEST);
    }

    const inquiry = await inquiryModel.create(value);

    return successResponse(
      res,
      'Inquiry created successfully',
      inquiry,
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    return errorResponse(res, 'Internal Server Error');
  }
};

export const createConsultation = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { isValid, message, value } = validation<IConsultation>(
      req.body,
      consultationBookingValidationSchema
    );
    if (!isValid) {
      return errorResponse(res, message, HTTP_STATUS.BAD_REQUEST);
    }

    const checkBooking = isValidTimeRangeForOnlineService(
      value.startDateTime,
      value.endDateTime
    );

    if (!checkBooking) {
      return errorResponse(res, 'Booking time invalid.', HTTP_STATUS.NOT_FOUND);
    }

    const currentDate = new Date();

    // Check if the user has an active consultation (end date should be in the future)
    const existingConsultation = await consultationModel.findOne({
      userId: res.locals.userId,
      endDateTime: { $gt: currentDate }, // Consultation end date must be greater than the current date
      consultationType: value.consultationType,
    });
    if (existingConsultation) {
      return errorResponse(
        res,
        'You already have an active consultation.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const startDate = new Date(value.startDateTime);
    startDate.setSeconds(0, 0); // Reset seconds and milliseconds

    const endDate = new Date(value.endDateTime);
    endDate.setSeconds(59, 0); // Reset seconds and milliseconds

    const checkSlotAvailable = await consultationModel.findOne({
      startDateTime: { $gte: startDate },
      endDateTime: { $lte: endDate },
      consultationType: value.consultationType,
    });
    if (checkSlotAvailable) {
      return errorResponse(
        res,
        'Slot already booked.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const amount =
      value.consultationType === consultationTypeEnum.euthanasia
        ? serviceConsultationEuthanasiaPriceObj.discountedAmount
        : serviceConsultationPriceObj.discountedAmount;
    const razorpayOrder = await razorpayPayment(amount, {
      isConsultationBooking: true,
    });
    value.userId = res.locals.userId;
    value.providerOrderId = razorpayOrder.id;
    value.amount = amount;

    await consultationModel.create(value);

    return successResponse(
      res,
      'Consultation created successfully',
      {
        providerOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    return errorResponse(res, 'Internal Server Error');
  }
};

export const getConsultationList = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { fromDate, toDate } = req.query;
    let { consultationType } = req.query;

    consultationType = consultationType ?? consultationTypeEnum.normal;
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

    const [consultation] = await consultationModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(res.locals.userId as string),
          consultationType,
          ...(startDate &&
            endDate && {
              startDateTime: { $gte: startDate },
              endDateTime: { $lte: endDate },
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
      { $sort: { createdAt: -1 } },
      {
        $project: {
          petName: {
            $first: '$pet.name',
          },
          petType: {
            $first: '$pet.petType',
          },
          startDateTime: 1,
          endDateTime: 1,
          appointmentReason: 1,
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
      'Consultation list get successfully',
      consultation,
      HTTP_STATUS.OK
    );
  } catch (error) {
    return errorResponse(res, 'Internal Server Error');
  }
};

export const getAllConsultationList = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { fromDate, toDate } = req.query;
    let { consultationType } = req.query;

    consultationType = consultationType ?? consultationTypeEnum.normal;
    // const limit = +(req.query?.limit ?? 10);
    // const page = +(req.query?.page ?? 1);
    // const skip: number = (page - 1) * limit;

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
          consultationType,
          ...(startDate &&
            endDate && {
              startDateTime: { $gte: startDate },
              endDateTime: { $lte: endDate },
            }),
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          startDateTime: 1,
          endDateTime: 1,
          appointmentReason: 1,
          providerOrderId: 1,
          paymentStatus: 1,
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
      consultation,
      HTTP_STATUS.OK
    );
  } catch (error) {
    return errorResponse(res, 'Internal Server Error');
  }
};

export const addServiceRecord = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { isValid, message, value } = validation<IServiceRecord>(
      req.body,
      vaccinationLastRecordValidationSchema
    );
    if (!isValid) {
      return errorResponse(res, message, HTTP_STATUS.BAD_REQUEST);
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
    value.lastDateTime = value.lastDateTime;
    value.userId = res.locals.userId;

    const serviceRecord = await serviceRecordModel.create(value);

    return successResponse(
      res,
      'Service record created successfully',
      serviceRecord,
      HTTP_STATUS.CREATED
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
    const { petId } = req.query;

    const limit = +(req.query?.limit ?? 10);
    const page = +(req.query?.page ?? 1);
    const sort = (req.query?.sort ?? 'desc');
    const skip: number = (page - 1) * limit;

    const [serviceRecord] = await serviceRecordModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(res.locals.userId as string),
          $and: [
            { image: { $ne: null } }, // Not null
            { image: { $ne: '' } }, // Not an empty string
            { image: { $exists: true } }, // Exists in the document
          ],
          ...(petId && {
            petId: new mongoose.Types.ObjectId(petId as string),
          }),
        },
      },
      // {
      //   $lookup: {
      //     from: 'serviceitems',
      //     localField: 'serviceItemId',
      //     foreignField: '_id',
      //     as: 'serviceItems',
      //   },
      // },
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
      { $sort: { createdAt: sort === 'asc' ? 1 : -1 } },
      {
        $project: {
          serviceName: {
            $first: '$service.name',
          },
          serviceType: {
            $first: '$service.serviceType',
          },
          // serviceItemName: {
          //   $first: '$serviceItems.name',
          // },
          petName: {
            $first: '$pet.name',
          },
          petType: {
            $first: '$pet.petType',
          },
          serviceId: 1,
          serviceItemId: 1,
          name: 1,
          petId: 1,
          lastDateTime: 1,
          image: 1,
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

export const getServiceRecordDetails = async (
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

    const serviceRecord = await serviceRecordModel.findById(value.id);
    if (!serviceRecord) {
      return errorResponse(
        res,
        'Service record not found.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

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

export const updateServiceRecord = async (
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

    const serviceRecord = await serviceRecordModel.findOne({
      _id: value.id,
      userId: res.locals.userId,
    });
    if (!serviceRecord) {
      return errorResponse(
        res,
        'Service record not found.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const checkBooking = await bookingModel.findOne({
      serviceRecordId: serviceRecord._id,
    });
    if (checkBooking) {
      return errorResponse(
        res,
        "You can't access to edit this service record.",
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
      if (serviceRecord.image) {
        await deleteFile(serviceRecord.image);
      }
    }

    const { id, ...rest } = value;
    await serviceRecordModel.updateOne({ _id: id }, rest, { new: true });

    return successResponse(
      res,
      'Service record updated successfully',
      null,
      HTTP_STATUS.OK
    );
  } catch (error) {
    console.log('🚀 ~ error:', error);
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
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
          userId: new mongoose.Types.ObjectId(res.locals.userId as string),
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
          servicerecords: {
            $first: '$servicerecords',
          },
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

export const updateConsultation = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { isValid, message, value } = validation<IConsultation>(
      req.body,
      consultationUpdateValidationSchema
    );
    if (!isValid) {
      return errorResponse(res, message, HTTP_STATUS.BAD_REQUEST);
    }

    // Fetch the existing consultation
    const existingConsultation = await consultationModel.findById(value._id);
    if (!existingConsultation) {
      return errorResponse(
        res,
        'Consultation not found.',
        HTTP_STATUS.NOT_FOUND
      );
    }

    // Check if the status is not "success"
    if (
      existingConsultation.consultationStatus === ConsultationStatusEnum.success
    ) {
      return errorResponse(
        res,
        'Cannot update a consultation with status "success".',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Check if the consultation start time is within 2 hours
    const currentTime = new Date();
    const oldStartTime = new Date(existingConsultation.startDateTime);
    const timeDifference =
      (oldStartTime.getTime() - currentTime.getTime()) / (1000 * 60); // Difference in minutes

    if (timeDifference < 120) {
      return errorResponse(
        res,
        'Consultation cannot be updated less than 2 hours before start time.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const checkBooking = isValidTimeRangeForOnlineService(
      value.startDateTime,
      value.endDateTime
    );

    if (!checkBooking) {
      return errorResponse(res, 'Booking time invalid.', HTTP_STATUS.NOT_FOUND);
    }

    const startDate = new Date(value.startDateTime);
    startDate.setSeconds(0, 0); // Reset seconds and milliseconds

    const endDate = new Date(value.endDateTime);
    endDate.setSeconds(59, 0); // Reset seconds and milliseconds

    const checkSlotAvailable = await consultationModel.findOne({
      startDateTime: { $gte: startDate },
      endDateTime: { $lte: endDate },
      consultationType: existingConsultation.consultationType,
    });
    if (checkSlotAvailable) {
      return errorResponse(
        res,
        'Slot already booked.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Update the consultation
    const updatedConsultation = await consultationModel.findByIdAndUpdate(
      value._id,
      { $set: value },
      { new: true }
    );

    return successResponse(
      res,
      'Consultation updated successfully',
      updatedConsultation,
      HTTP_STATUS.OK
    );
  } catch (error) {
    return errorResponse(res, 'Internal Server Error');
  }
};

export const getUpcomingConsultationDetails = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    let { consultationType } = req.query;

    consultationType = consultationType ?? consultationTypeEnum.normal;

    const consultation = await consultationModel
      .findOne(
        {
          userId: res.locals.userId,
          startDateTime: { $gte: new Date() },
          consultationType,
        },
        {
          _id: 1,
          startDateTime: 1,
          endDateTime: 1,
          appointmentReason: 1,
          paymentStatus: 1,
          providerOrderId: 1,
          providerOrderStatus: 1,
          consultationStatus: 1,
          petId: 1,
        }
      )
      .sort({ startDateTime: -1 });

    if (!consultation) {
      return successResponse(
        res,
        'Upcoming consultation details get successfully',
        {},
        HTTP_STATUS.OK
      );
    }

    return successResponse(
      res,
      'Upcoming consultation details get successfully',
      consultation,
      HTTP_STATUS.OK
    );
  } catch (error) {
    console.log('🚀 ~ error:', error);
    return errorResponse(res, 'Internal Server Error');
  }
};

export const createTravel = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { isValid, message, value } = validation<ITravel>(
      req.body,
      travelBookingValidationSchema
    );
    console.log('🚀 ~ req.body:', req.body);
    if (!isValid) {
      return errorResponse(res, message, HTTP_STATUS.BAD_REQUEST);
    }

    const travelServiceDate = await serviceModel.findOne({
      slug: 'travel',
    });
    if (!travelServiceDate) {
      return errorResponse(
        res,
        'Travel service not found.',
        HTTP_STATUS.NOT_FOUND
      );
    }

    const amount = travelServiceDate.discountedAmount ?? 0;
    const razorpayOrder = await razorpayPayment(amount, {
      isTravelBooking: true,
    });

    const image = await uploadFile(req.file, UploadImageModuleEnum.TRAVEL, '');
    if (!image.isValid) {
      return errorResponse(
        res,
        'Error uploading image',
        HTTP_STATUS.BAD_REQUEST
      );
    }
    value.vaccinationRecord = image.fileName;

    value.userId = res.locals.userId;
    value.providerOrderId = razorpayOrder.id;
    value.amount = amount;
    
    await travelModel.create(value);

    return successResponse(
      res,
      'Travel created successfully',
      {
        providerOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    return errorResponse(res, 'Internal Server Error');
  }
};

export const getTravelList = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { petId, travelType } = req.query;

    const limit = +(req.query?.limit ?? 10);
    const page = +(req.query?.page ?? 1);
    const skip: number = (page - 1) * limit;

    const [travel] = await travelModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(res.locals.userId as string),
          ...(petId && {
            petId: new mongoose.Types.ObjectId(petId as string),
          }),
          ...(travelType && { travelType }),
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
      'Travel list get successfully',
      travel,
      HTTP_STATUS.OK
    );
  } catch (error) {
    return errorResponse(res, 'Internal Server Error');
  }
};

const isValidTimeRange = (date: Date) => {
  console.log('🚀 ~ isValidTimeRange ~ date:', date);
  const hours = date.getHours();
  console.log('🚀 ~ isValidTimeRange ~ hours:', hours);

  // Check if time is between 8 AM to 12 PM or 2 PM to 8 PM
  // const isInRange1 = hours >= 8 && hours < 12; // 8 AM to 12 PM
  // const isInRange2 = hours >= 14 && hours < 21; // 2 PM to 8 PM
  const isInRange2 = hours >= 8 && hours < 21; // 8 AM to 8 PM
  console.log(
    '🚀 ~ isValidTimeRange ~ hours >= 8 && hours < 21:',
    hours >= 8 && hours < 21
  );

  // return isInRange1 || isInRange2;
  // return isInRange2;
  return true;
};

const isValidTimeRangeForOnlineService = (
  startDateTime: Date,
  endDateTime: Date
) => {
  const date = new Date();
  if (!(new Date(startDateTime) >= date && new Date(endDateTime) >= date)) {
    return false;
  }

  const startDate = new Date(startDateTime).getTime();
  const endDate = new Date(endDateTime).getTime();
  const currentDate = new Date().getTime();

  // Condition 1: Check if start date is greater than 2 hours from the current time
  const durationInHours = (startDate - currentDate) / (1000 * 60 * 60); // Difference in hours
  const isStartDateGreaterThanTwoHours = durationInHours > 2;
  console.log(
    'Start date is more than 2 hours ahead of current date:',
    isStartDateGreaterThanTwoHours
  );

  // Condition 2: Check if start and end time difference is exactly 15 minutes
  const timeDifferenceInMinutes = (endDate - startDate) / (1000 * 60); // Difference in minutes
  const isTimeDifferenceFifteenMinutes =
    Math.round(timeDifferenceInMinutes) === 15;

  // Condition 3: Check if date difference from current date is less than 15 days
  const dateDifferenceInDays =
    (startDate - currentDate) / (1000 * 60 * 60 * 24); // Difference in days
  const isDateDifferenceLessThanFifteen = dateDifferenceInDays < 15;

  console.log(
    'Start and end time difference is 15 minutes:',
    isTimeDifferenceFifteenMinutes
  );
  console.log(
    'Date difference is less than 15 days:',
    isDateDifferenceLessThanFifteen
  );
  return (
    isStartDateGreaterThanTwoHours &&
    isTimeDifferenceFifteenMinutes &&
    isDateDifferenceLessThanFifteen
  );
};

const isValidBookingSlot = (serviceItem: ICreateBooking, value: IBooking) => {
  try {
    const currentDate = new Date();
    if (
      !(
        new Date(value.startDateTime) >= currentDate &&
        new Date(value.endDateTime) >= currentDate
      )
    ) {
      return false;
    }

    if (['Home', 'Health'].includes(serviceItem.serviceType)) {
      return (
        isValidTimeRange(value.startDateTime) &&
        isValidTimeRange(value.endDateTime)
      );
    }

    return true;
  } catch (error) {
    return false;
  }
};
