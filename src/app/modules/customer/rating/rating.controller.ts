
import { Request, Response } from "express";
import { RatingService } from "./rating.service";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../../shared/catchAsync";
import { IUser } from "../../user/user.interface";
import sendResponse from "../../../../shared/sendResponse";

const addRating = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { digitalCardId, promotionId, merchantId, rating, comment } = req.body;

  const userId = user._id?.toString();
  if (!userId) {
    return sendResponse(res, {
      statusCode: StatusCodes.BAD_REQUEST,
      success: false,
      message: "User ID not found",
    });
  }

  const data = await RatingService.createRating(
    userId,
    digitalCardId,
    promotionId,
    merchantId,
    rating,
    comment
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Rating submitted successfully",
    data: data,
  });
});

const getMerchantRatings = catchAsync(async (req: Request, res: Response) => {
  const { merchantId } = req.params;

  const data = await RatingService.getMerchantRatings(merchantId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Ratings fetched successfully",
    data: data,
  });
});

const getMerchantAverageRating = catchAsync(
  async (req: Request, res: Response) => {
    const { merchantId } = req.params;

    const data = await RatingService.getMerchantAverageRating(merchantId);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Merchant average rating retrieved successfully",
      data: data,
    });
  }
);

export const RatingController = {
  addRating,
  getMerchantRatings,
  getMerchantAverageRating
};
