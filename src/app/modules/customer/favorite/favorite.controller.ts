
import { Request, Response } from "express";
import { FavoriteService } from "./favorite.service";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../../shared/catchAsync";
import { IUser } from "../../user/user.interface";
import sendResponse from "../../../../shared/sendResponse";


const addFavorite = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { merchantId } = req.body;

  const data = await FavoriteService.toggleFavorite(user._id?.toString() || "", merchantId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: data.isFavorite 
      ? "Merchant added to favorites" 
      : "Merchant removed from favorites",
    data: data,
  });
});


const getFavorites = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUser;

  const data = await FavoriteService.getUserFavorites(user._id?.toString() || "");

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Favorite merchants fetched",
    data: data,
  });
});

const removeFavorite = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { merchantId } = req.params;

  const data = await FavoriteService.removeFavorite(
    user._id?.toString() || "",
    merchantId
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Merchant removed from favorites",
    data: data,
  });
});

export default {
  addFavorite,
  getFavorites,
  removeFavorite,
};
