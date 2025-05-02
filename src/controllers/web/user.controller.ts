import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { HTTP_STATUS } from '../../constants';
import { UploadImageModuleEnum } from '../../enums';
import { deleteFile, uploadFile } from '../../helper/s3.helper';
import { IUser, serviceModel, userModel } from '../../models';
import { serviceRecordModel } from '../../models/servicRecord';
import { errorResponse, successResponse } from '../../utils/responseHandler';
import { validation } from '../../utils/validate';
import {
  signInSchema,
  userDetailsValidationSchema,
  validateOtpSchema,
} from '../../validations';
import { generateOtpWithExpiry } from '../../helper/common.helper';
import { sendOtpToUser } from '../../helper/otp.helper';
import { ISignIn, IValidateOtp } from '../../types';

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
      slug: 'vaccinations',
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
    let verify = false;
    if (value.alternateMobileNumber) {
      const existingUser = await userModel.findOne({
        _id: { $ne: userId },
        $or: [
          { mobileNumber: value.alternateMobileNumber },
          { alternateMobileNumber: value.alternateMobileNumber },
        ],
      });
      if (existingUser) {
        return errorResponse(
          res,
          'User already registered with this number.',
          HTTP_STATUS.BAD_REQUEST
        );
      }
      const { otp, expiresAt } = generateOtpWithExpiry();

      value.alternateMobileNumberOtp = otp;
      value.alternateMobileNumberOtpExpiry = expiresAt;
      value.isAlternateMobileNumberVerified = false;

      const isSendOtp = process.env.IS_SEND_OTP === 'true';
      if (isSendOtp) {
        await sendOtpToUser(value.alternateMobileNumber, otp);
      }
      verify = true;
    }

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
      {
        verify,
      },
      HTTP_STATUS.OK
    );
  } catch (error) {
    return errorResponse(res, 'Internal Server Error');
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = res.locals;
    const user = await userModel.findOne({ _id: userId, isActive: true });
    if (!user) {
      return errorResponse(res, 'User not found.', HTTP_STATUS.NOT_FOUND);
    }

    await userModel.updateOne({ _id: userId }, { $set: { isActive: false } });

    return successResponse(
      res,
      'User removed successfully',
      null,
      HTTP_STATUS.OK
    );
  } catch (err) {
    return errorResponse(res, 'Internal Server Error');
  }
};

export const validateAlternateMobileNumberOtp = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { isValid, message, value } = validation<IValidateOtp>(
      req.body,
      validateOtpSchema
    );
    if (!isValid) {
      return errorResponse(res, message, HTTP_STATUS.BAD_REQUEST);
    }

    const { mobileNumber, otp } = value;

    const user = await userModel.findOne({
      alternateMobileNumber: mobileNumber,
      alternateMobileNumberOtp: otp,
      alternateMobileNumberOtpExpiry: { $gte: Date.now() },
    });

    if (!user) {
      return errorResponse(res, 'Invalid OTP.', HTTP_STATUS.BAD_REQUEST);
    }

    await userModel.updateOne(
      { _id: user._id },
      {
        $set: {
          isAlternateMobileNumberVerified: true,
        },
      }
    );

    return successResponse(
      res,
      'User alternate mobile number is validated successfully',
      null,
      HTTP_STATUS.OK
    );
  } catch (err) {
    return errorResponse(res, 'Internal Server Error');
  }
};

export const resendOtp = async (req: Request, res: Response): Promise<any> => {
  try {
    console.log('in...');
    
    const { isValid, message, value } = validation<ISignIn>(
      req.body,
      signInSchema
    );
    if (!isValid) {
      return errorResponse(res, message, HTTP_STATUS.BAD_REQUEST);
    }

    const { mobileNumber } = value;

    const user = await userModel.findOne({
      alternateMobileNumber: mobileNumber,
    });
    console.log("🚀 ~ resendOtp ~ user:", user)
    if (!user) {
      return errorResponse(res, 'User not found.', HTTP_STATUS.NOT_FOUND);
    }

    const { otp, expiresAt } = generateOtpWithExpiry();

    await userModel.updateOne(
      { _id: user._id },
      {
        alternateMobileNumberOtp: otp,
        alternateMobileNumberOtpExpiry: expiresAt,
      }
    );

    const isSendOtp = process.env.IS_SEND_OTP === 'true';
    if (isSendOtp) {
      await sendOtpToUser(mobileNumber, otp);
    }

    return successResponse(
      res,
      'OTP sent successfully',
      !isSendOtp ? { otp } : null,
      HTTP_STATUS.OK
    );
  } catch (err) {
    console.log("🚀 ~ resendOtp ~ err:", err)
    return errorResponse(res, 'Internal Server Error');
  }
};
