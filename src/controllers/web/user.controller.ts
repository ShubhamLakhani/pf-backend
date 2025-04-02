import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { HTTP_STATUS } from '../../constants';
import { UploadImageModuleEnum } from '../../enums';
import { deleteFile, uploadFile } from '../../helper/s3.helper';
import { IUser, serviceModel, userModel } from '../../models';
import { serviceRecordModel } from '../../models/servicRecord';
import { errorResponse, successResponse } from '../../utils/responseHandler';
import { validation } from '../../utils/validate';
import { userDetailsValidationSchema } from '../../validations';

export const getUserDetails = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { userId } = res.locals;

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

export const getNextVaccinationData = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { petId } = req.query;

    const serviceVaccination = await serviceModel.findOne({
      name: 'VACCINATIONS',
      serviceType: 'Home',
    });

    const [nextVaccination] = await serviceRecordModel.aggregate([
      {
        $match: {
          serviceId: new mongoose.Types.ObjectId(serviceVaccination?._id),
          userId: new mongoose.Types.ObjectId(res.locals.userId as string),
          ...(petId &&
            petId !== '' && {
              petId: new mongoose.Types.ObjectId(petId as string),
            }),
        },
      },
      {
        $lookup: {
          from: 'serviceitems',
          let: {
            serviceItemId: '$serviceItemId',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$serviceItemId'],
                },
                'metaData.notify': true,
              },
            },
          ],
          as: 'result',
        },
      },
      {
        $unwind: '$result',
      },
      {
        $addFields: {
          daysDifference: {
            $toInt: {
              $dateDiff: {
                startDate: '$lastDateTime',
                endDate: '$$NOW',
                unit: 'day',
              },
            },
          },
          validDays: {
            $toInt: '$result.metaData.durationValue',
          },
        },
      },
      {
        $addFields: {
          stillDays: {
            $add: ['$daysDifference', '$validDays'],
          },
        },
      },
      {
        $match: {
          $expr: {
            $gt: ['$validDays', '$daysDifference'],
          },
        },
      },
      {
        $lookup: {
          from: 'serviceitems',
          let: {
            validDays: '$validDays',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $gt: [
                    {
                      $toInt: '$metaData.durationValue',
                    },
                    '$$validDays',
                  ],
                },
                'metaData.notify': true,
              },
            },
            {
              $addFields: {
                durationInt: { $toInt: '$metaData.durationValue' },
              },
            },
            {
              $sort: {
                durationInt: 1,
              },
            },
            {
              $limit: 1,
            },
          ],
          as: 'nextVaccine',
        },
      },
      {
        $unwind: '$nextVaccine',
      },
      {
        $addFields: {
          nextVaccineValidDays: {
            $toInt: '$nextVaccine.metaData.durationValue',
          },
        },
      },
      {
        $addFields: {
          absDifference: {
            $abs: {
              $subtract: ['$stillDays', '$nextVaccineValidDays'],
            },
          },
        },
      },
      {
        $sort: {
          absDifference: 1,
        },
      },
      {
        $limit: 1,
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
        $unwind: {
          path: '$pet',
        },
      },
      {
        $project: {
          _id: 0,
          petId: 1,
          serviceItemId: 1,
          endDateTime: 1,
          absDifference: 1,
          nextVaccineValidDays: 1,
          petName: '$pet.name',
          serviceItemName: '$nextVaccine.name',
        },
      },
    ]);

    return successResponse(
      res,
      'User pet next vaccination get successfully',
      nextVaccination,
      HTTP_STATUS.OK
    );
  } catch (error) {
    return errorResponse(res, 'Internal Server Error');
  }
};

export const updateUserDetails = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { isValid, message, value } = validation<IUser>(
      req.body,
      userDetailsValidationSchema
    );
    if (!isValid) {
      return errorResponse(res, message, HTTP_STATUS.BAD_REQUEST);
    }

    const { userId, user } = res.locals;
    /* Uncomment if validate mobile number on update */
    // if (user.mobileNumber !== value.mobileNumber && value.otp) {
    //   const existingUser = await userModel.findOne({
    //     mobileNumber: value.mobileNumber,
    //   });
    //   if (existingUser) {
    //     return errorResponse(
    //       res,
    //       'User already registered with this number.',
    //       HTTP_STATUS.BAD_REQUEST
    //     );
    //   }
    // }

    if (req.file) {
      const image = await uploadFile(
        req.file,
        UploadImageModuleEnum.USER_PROFILE,
        ''
      );
      if (!image.isValid) {
        return errorResponse(
          res,
          'Error uploading image',
          HTTP_STATUS.BAD_REQUEST
        );
      }
      value.profileImage = image.fileName;
      if (user.profileImage) {
        await deleteFile(user.profileImage);
      }
    } else {
      delete value?.profileImage;
    }

    const data = await userModel.findByIdAndUpdate(userId, value, {
      new: true,
    });

    return successResponse(
      res,
      'User details updated successfully',
      data,
      HTTP_STATUS.OK
    );
  } catch (error) {
    return errorResponse(res, 'Internal Server Error');
  }
};
