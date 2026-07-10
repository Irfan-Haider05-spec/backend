import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { RecentViewedPromotionService } from "./recentViewedPromotion.service";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";

const addRecentViewed = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const data = await RecentViewedPromotionService.addRecentViewedToDB(
    user._id,
    req.body.promotionId
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Recent viewed promotion added successfully",
    data: data,
  });
});

const getRecentViewed = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const data = await RecentViewedPromotionService.getRecentViewedFromDB(
    user._id
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Recent viewed promotions fetched successfully",
    data: data,
  });
});

export const RecentViewedPromotionController = {
  addRecentViewed,
  getRecentViewed,
};
