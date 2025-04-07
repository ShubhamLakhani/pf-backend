import { Request, Response } from "express";
import { breedsModel } from "../../models/breeds";
import { errorResponse, successResponse } from "../../utils/responseHandler";
import { HTTP_STATUS } from "../../constants";

export const getBreedList = async (req: Request, res: Response): Promise<any> => {
  try {
    const { filter, petType } = req.query;

    const breeds = await breedsModel
      .find({
        ...(petType && { pet_type:petType }),
        ...(filter && { breed_name: { $regex: new RegExp(filter as string, 'i') } }),
      })
      .sort({ createdAt: -1 });

    if (!breeds.length) {
      return successResponse(res, 'Pets get successfully', [], HTTP_STATUS.OK);
    }

    return successResponse(res, 'Pets get successfully', breeds, HTTP_STATUS.OK);
  } catch (error) {
    return errorResponse(res, 'Internal Server Error');
  }
};