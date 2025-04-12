import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { HTTP_STATUS } from '../../constants';
import {
  serviceConsultationEuthanasiaPriceObj,
  serviceConsultationPriceObj,
} from '../../constants/common.constants';
import { consultationTypeEnum, UploadImageModuleEnum } from '../../enums';
import { generateUniqueSlug } from '../../helper/common.helper';
import { toSlug } from '../../helper/common.helper';
import { deleteFile, uploadFile } from '../../helper/s3.helper';
import {
  IService,
  IServiceItems,
  serviceItemsModel,
  serviceModel,
} from '../../models';
import { serviceConfigModel } from '../../models/serviceConfig';
import { IServicePrice } from '../../utils/common.interface';
import { errorResponse, successResponse } from '../../utils/responseHandler';
import { validation } from '../../utils/validate';
import {
  createServiceItemSchema,
  paramMongoIdSchema,
  updateServiceItemSchema,
  updateServicePriceSchema,
  updateServiceSchema,
} from '../../validations';

export const createServiceItem = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    console.log('req.body.metaData..>>>', req.body);

    req.body.metaData = JSON.parse(req.body.metaData);

    const { isValid, message, value } = validation<IServiceItems>(
      req.body,
      createServiceItemSchema
    );

    if (!isValid) {
      return errorResponse(res, message, HTTP_STATUS.BAD_REQUEST);
    }

    value.slug = await generateUniqueSlug(value.name);

    // value.slug = toSlug(value.name);
    // const checkServiceItem = await serviceItemsModel.findOne({
    //   slug: value.slug,
    // });
    // if (checkServiceItem) {
    //   return errorResponse(
    //     res,
    //     'Service item already exists.',
    //     HTTP_STATUS.BAD_REQUEST
    //   );
    // }

    if (req.file) {
      const image = await uploadFile(
        req.file,
        UploadImageModuleEnum.SERVICE_ITEM,
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
    }

    const serviceItem = await serviceItemsModel.create(value);

    return successResponse(
      res,
      'Service item created successfully',
      serviceItem,
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    console.log('error.....>>>', error);
    return errorResponse(res, 'Internal Server Error');
  }
};

export const getServiceItemList = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { filter, serviceId, isFeatured } = req.query;
    const limit = +(req.query?.limit ?? 10);
    const page = +(req.query?.page ?? 1);
    const skip: number = (page - 1) * limit;
    const isFeaturedBool = isFeatured === 'true' ? true : false;

    let isServiceVaccination = false;

    if (serviceId) {
      const service = await serviceModel.findOne({
        _id: serviceId,
        slug: 'vaccinations',
        serviceType: 'Home',
      });
      if (service) {
        isServiceVaccination = true;
      }
    }
    const aggregate: any[] = [
      {
        $match: {
          ...(serviceId && {
            serviceId: new mongoose.Types.ObjectId(serviceId as string),
          }),
          ...(filter && {
            name: { $regex: new RegExp(filter as string, 'i') },
          }),
          ...(isFeaturedBool && {
            'metaData.isFeatured': isFeaturedBool,
          }),
        },
      },
      {
        $lookup: {
          from: 'services',
          localField: 'serviceId',
          foreignField: '_id',
          as: 'result',
        },
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

    aggregate.push(
      ...[
        {
          $project: {
            serviceId: 1,
            name: 1,
            image: 1,
            amount: 1,
            discountedAmount: 1,
            metaData: 1,
            slug: 1,
            serviceName: {
              $first: '$result.name',
            },
            serviceType: {
              $first: '$result.serviceType',
            },
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
      ]
    );

    const data = await serviceItemsModel.aggregate(aggregate);

    return successResponse(
      res,
      'Service item list get successfully',
      data?.[0],
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

export const updateServiceItem = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    req.body.metaData = JSON.parse(req.body.metaData);

    const { isValid, message, value } = validation<IServiceItems>(
      req.body,
      updateServiceItemSchema
    );

    if (!isValid) {
      return errorResponse(res, message, HTTP_STATUS.BAD_REQUEST);
    }

    const { _id, ...updateObj } = value;

    const serviceItem = await serviceItemsModel.findById(_id);

    if (!serviceItem) {
      return errorResponse(
        res,
        'Service item data not found.',
        HTTP_STATUS.NOT_FOUND
      );
    }

    if (updateObj.name) {
      updateObj.slug = await generateUniqueSlug(value.name, _id as any);
      // updateObj.slug = toSlug(updateObj.name);
      // const checkServiceItem = await serviceItemsModel.findOne({
      //   _id: { $ne: _id },
      //   slug: updateObj.slug,
      // });
      // if (checkServiceItem) {
      //   return errorResponse(
      //     res,
      //     'Service item already exists.',
      //     HTTP_STATUS.BAD_REQUEST
      //   );
      // }
    }

    if (req.file) {
      const image = await uploadFile(
        req.file,
        UploadImageModuleEnum.SERVICE_ITEM,
        ''
      );
      if (!image.isValid) {
        return errorResponse(
          res,
          'Error uploading image',
          HTTP_STATUS.BAD_REQUEST
        );
      }
      updateObj.image = image.fileName;
      if (serviceItem.image) {
        await deleteFile(serviceItem.image);
      }
    } else {
      delete updateObj.image;
    }

    await serviceItemsModel.updateOne({ _id }, updateObj);

    return successResponse(
      res,
      'Service item updated successfully',
      null,
      HTTP_STATUS.OK
    );
  } catch (error) {
    return errorResponse(res, 'Internal Server Error');
  }
};

export const deleteServiceItem = async (
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

    const serviceItem = await serviceItemsModel.findById(id);

    if (!serviceItem) {
      return errorResponse(
        res,
        'Service item data not found.',
        HTTP_STATUS.NOT_FOUND
      );
    }

    await serviceItemsModel.deleteOne({ _id: id });

    return successResponse(
      res,
      'Service item deleted successfully',
      null,
      HTTP_STATUS.OK
    );
  } catch (error) {
    return errorResponse(res, 'Internal Server Error');
  }
};

export const updateService = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { isValid, message, value } = validation<IService>(
      req.body,
      updateServiceSchema
    );

    if (!isValid) {
      return errorResponse(res, message, HTTP_STATUS.BAD_REQUEST);
    }

    const { _id, ...rest } = value;
    const updateObj = { ...rest } as any;

    const service = (await serviceModel.findById(_id)) as any;
    if (!service) {
      return errorResponse(
        res,
        'Service data not found.',
        HTTP_STATUS.NOT_FOUND
      );
    }

    if (req.files) {
      const files = req.files as any;
      for (let key in files) {
        const value = files[key];
        // Assuming you want to handle only the first file in the array (if multiple files are uploaded under a key)
        const file = value[0]; // Use the first file in case of multiple files
        const image = await uploadFile(file, UploadImageModuleEnum.SERVICE, '');

        if (!image.isValid) {
          return errorResponse(
            res,
            'Error uploading image',
            HTTP_STATUS.BAD_REQUEST
          );
        }

        updateObj[key] = image.fileName;

        // If a file already exists in the service object, delete it
        if (service[key]) {
          await deleteFile(service[key]);
        }
      }
    } else {
      delete updateObj.image;
      delete updateObj.mobileImage;
    }

    await serviceModel.updateOne({ _id }, updateObj);

    return successResponse(
      res,
      'Service updated successfully',
      null,
      HTTP_STATUS.OK
    );
  } catch (error) {
    return errorResponse(res, 'Internal Server Error');
  }
};

export const setServiceConsultationPrice = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { isValid, message, value } = validation<IServicePrice>(
      req.body,
      updateServicePriceSchema
    );

    if (!isValid) {
      return errorResponse(res, message, HTTP_STATUS.BAD_REQUEST);
    }
    const { consultationType, amount, discountedAmount } = value;

    let updateFields: Record<string, any> = {};
    updateFields[`metaData.${consultationType}.amount`] = amount;
    updateFields[`metaData.${consultationType}.discountedAmount`] =
      discountedAmount;

    await serviceConfigModel.updateOne(
      { name: 'CONSULTATION' },
      {
        $set: updateFields,
      }
    );

    if (consultationType === consultationTypeEnum.euthanasia) {
      serviceConsultationEuthanasiaPriceObj.amount = value.amount;
      serviceConsultationEuthanasiaPriceObj.discountedAmount =
        value.discountedAmount;
    } else {
      serviceConsultationPriceObj.amount = value.amount;
      serviceConsultationPriceObj.discountedAmount = value.discountedAmount;
    }

    return successResponse(
      res,
      'Service price updated successfully',
      serviceConsultationPriceObj,
      HTTP_STATUS.OK
    );
  } catch (error) {
    return errorResponse(res, 'Internal Server Error');
  }
};
