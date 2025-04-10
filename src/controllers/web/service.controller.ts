import { Request, Response } from 'express';
import mongoose from 'mongoose';
import {
  HTTP_STATUS,
  serviceConsultationEuthanasiaPriceObj,
  serviceConsultationPriceObj,
} from '../../constants';
import { serviceItemsModel, serviceModel } from '../../models';
import { errorResponse, successResponse } from '../../utils/responseHandler';
import { validation } from '../../utils/validate';
import { paramMongoIdSchema } from '../../validations';
import { consultationTypeEnum } from '../../enums';

export const getServiceList = async (
  _req: Request,
  res: Response
): Promise<any> => {
  try {
    const service = await serviceModel.find();

    if (!service.length) {
      return errorResponse(
        res,
        'Service data not found.',
        HTTP_STATUS.NOT_FOUND
      );
    }

    return successResponse(
      res,
      'Service get successfully',
      service,
      HTTP_STATUS.OK
    );
  } catch (error) {
    return errorResponse(res, 'Internal Server Error');
  }
};

export const getServiceItemList = async (
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
    const { petType, isFeatured } = req.query;
    const isFeaturedBool = isFeatured === 'true' ? true : false;

    let isServiceVaccination = false;

    const service = await serviceModel.findOne({
      _id: id,
      slug: 'vaccinations',
      serviceType: 'Home',
    });
    if (service) {
      isServiceVaccination = true;
    }

    const aggregate: any[] = [
      {
        $match: {
          serviceId: new mongoose.Types.ObjectId(id as string),
          ...(petType && {
            'metaData.petType': petType,
          }),
          ...(isFeaturedBool && {
            'metaData.isFeatured': isFeaturedBool,
          }),
        },
      },
      {
        $unset:
          'metaData.productDetail' /* TO-DO: need to update when finalize field */,
      },
    ];

    if (isServiceVaccination) {
      aggregate.push(
        ...[
          {
            $addFields: {
              sortOrder: {
                $cond: {
                  if: { $eq: ['$metaData.notify', true] },
                  then: 0,
                  else: 1,
                },
              },
            },
          },
          {
            $sort: {
              sortOrder: 1,
              'metaData.validDays': 1,
            },
          },
        ]
      );
    } else {
      aggregate.push({ $sort: { createdAt: -1 } });
    }

    const data = await serviceItemsModel.aggregate(aggregate);

    return successResponse(
      res,
      'Service item list get successfully',
      data,
      HTTP_STATUS.OK
    );
  } catch (error) {
    return errorResponse(res, 'Internal Server Error');
  }
};
export const getFrequentlyBookedItemList = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const aggregate: any[] = [
      {
        $match: {
          'metaData.isFrequentlyBooked': true,
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
      {$addFields: {serviceNameSlug: {$first: '$service.slug'}}},
      {
        $unset:
          'metaData.productDetail' /* TO-DO: need to update when finalize field */,
      },
      { $sort: { createdAt: -1 } },
    ];

    const data = await serviceItemsModel.aggregate(aggregate);

    return successResponse(
      res,
      'Service item list get successfully',
      data,
      HTTP_STATUS.OK
    );
  } catch (error) {
    return errorResponse(res, 'Internal Server Error');
  }
};

export const getServiceItemDetails = async (
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

    const serviceItem = await serviceItemsModel.findOne({ slug: id });

    if (!serviceItem) {
      return errorResponse(
        res,
        'Service item data not found.',
        HTTP_STATUS.NOT_FOUND
      );
    }

    return successResponse(
      res,
      'Service item details get successfully',
      serviceItem,
      HTTP_STATUS.OK
    );
  } catch (error) {
    return errorResponse(res, 'Internal Server Error');
  }
};

export const getServiceConsultationPrice = (
  req: Request,
  res: Response
): any => {
  let { consultationType } = req.query;

  consultationType = consultationType ?? consultationTypeEnum.normal;

  const priceObj =
    consultationType === consultationTypeEnum.euthanasia
      ? serviceConsultationEuthanasiaPriceObj
      : serviceConsultationPriceObj;

  return successResponse(
    res,
    'Service price get successfully',
    priceObj,
    HTTP_STATUS.OK
  );
};
