import { StatusCodes } from "http-status-codes";
import { DigitalCardService } from "./digitalCard.service";
import catchAsync from "../../../../shared/catchAsync";
import sendResponse from "../../../../shared/sendResponse";

import { IUser } from "../../user/user.interface";
import { Types } from "mongoose";




const addPromotion = catchAsync(async (req, res) => {
  if (!req.user) {
    return sendResponse(res, {
      statusCode: StatusCodes.UNAUTHORIZED,
      success: false,
      message: "User not authenticated",
    });
  }

  const user = req.user as IUser;
  const userId = (user._id as Types.ObjectId).toString();
  const { promotionId } = req.body;

  const data = await DigitalCardService.addPromotionToDigitalCard(
    userId,
    promotionId
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Promotion added to digital card successfully",
    data: data,
  });
});



const getUserAddedPromotions = catchAsync(async (req, res) => {
  if (!req.user) {
    return sendResponse(res, {
      statusCode: StatusCodes.UNAUTHORIZED,
      success: false,
      message: "User not authenticated",
    });
  }
  const user = req.user as IUser;
  const userId = (user._id as Types.ObjectId).toString();
  const data = await DigitalCardService.getUserAddedPromotions(
    userId,
    req.query
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User promotions retrieved successfully",
    data: data.data,
    pagination: data.pagination,
  });
});

const getUserDigitalCards = catchAsync(async (req, res) => {
  if (!req.user) {
    return sendResponse(res, {
      statusCode: StatusCodes.UNAUTHORIZED,
      success: false,
      message: "User not authenticated",
    });
  }

  const user = req.user as IUser;

  // Safely extract _id
  const userId = (user._id as Types.ObjectId).toString();

  const data = await DigitalCardService.getUserDigitalCards(
    userId,
    req.query
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User digital cards retrieved successfully",
    data: data.data,
    pagination: data.pagination,
  });
});

const getDigitalCardPromotions = catchAsync(async (req, res) => {
  const { digitalCardId } = req.params;

  const data = await DigitalCardService.getPromotionsOfDigitalCard(
    digitalCardId
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Digital card promotions retrieved successfully",
    data: data,
  });
});

const getMerchantDigitalCard = catchAsync(async (req, res) => {
  const { cardCode } = req.query;

  // 🔐 Auth check
  if (!req.user) {
    return sendResponse(res, {
      statusCode: StatusCodes.UNAUTHORIZED,
      success: false,
      message: "User not authenticated",
    });
  }

  const user = req.user as IUser;

  // 🛑 Role check (Merchant OR Sub-Merchant allowed)
  if (user.role !== "MERCHANT" && !user.isSubMerchant) {
    return sendResponse(res, {
      statusCode: StatusCodes.FORBIDDEN,
      success: false,
      message: "Only merchant or merchant staff can access this",
    });
  }

  // ✅ APPLY REQUESTED LOGIC
  const filterId = user.isSubMerchant
    ? user.merchantId
    : user._id;

  if (!filterId) {
    return sendResponse(res, {
      statusCode: StatusCodes.BAD_REQUEST,
      success: false,
      message: "Merchant ID not found",
    });
  }

  // 🧪 cardCode validation
  if (!cardCode || typeof cardCode !== "string") {
    return sendResponse(res, {
      statusCode: StatusCodes.BAD_REQUEST,
      success: false,
      message: "Card code or promotion code is required",
    });
  }

  // 🔍 Search digital card (cardCode OR promotionCode)
  const data =
    await DigitalCardService.getMerchantDigitalCardWithPromotions(
      filterId.toString(),
      cardCode
    );

  if (!data) {
    return sendResponse(res, {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: "No Digital Card for this customer found",
    });
  }

  // ✅ Success response
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Digital Card with promotions retrieved successfully",
    data: data,
  });
});



const createOrGetUserDigitalCard = catchAsync(async (req, res) => {
  if (!req.user) {
    return sendResponse(res, {
      statusCode: StatusCodes.UNAUTHORIZED,
      success: false,
      message: "User not authenticated",
    });
  }

  const user = req.user as any; // auth থেকে user info
  const userId = (user._id as Types.ObjectId).toString();

  const { merchantId } = req.body;
  if (!merchantId) {
    return sendResponse(res, {
      statusCode: StatusCodes.BAD_REQUEST,
      success: false,
      message: "merchantId is required",
    });
  }

  // Service call → check & create if not exist
  const data = await DigitalCardService.createOrGetDigitalCard(userId, merchantId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Digital card fetched/created successfully",
    data: {
      cardId: data._id,
      cardCode: data.cardCode,
      merchantId: data.merchantId,
      userId: data.userId,
    },
  });
});


export const DigitalCardController = {
  addPromotion,
  getUserAddedPromotions,
  getUserDigitalCards,
  getDigitalCardPromotions,
  getMerchantDigitalCard,
  createOrGetUserDigitalCard,
  //   approvePromotion
};
