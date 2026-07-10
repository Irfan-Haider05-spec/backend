import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { NotificationService } from "./notification.service";
import { JwtPayload } from "jsonwebtoken";

const getMyNotification = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as any;

  // ✅ Decide which ID to use for filtering
  const filterId = user.isSubMerchant ? user.merchantId : user._id;

  const data = await NotificationService.getUserNotificationFromDB(
    filterId,
    req.query
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Notification fetched successfully",
    data: data.data,
    pagination: data.pagination,
  });
});


const readMyNotifications = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const data = await NotificationService.readUserNotificationToDB(
    user as JwtPayload
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Notification read successfully",
    data: data,
  });
});
const sendTestNotification = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const data = await NotificationService.sendTestNotification(
    user as JwtPayload
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Notification sent successfully",
    data: data,
  });
});

const sendSalesRepActiveTestNotification = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const data = await NotificationService.sendSalesRepActiveTestNotification(
    user as JwtPayload
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Notification sent successfully",
    data: data,
  });
});


const getUnreadNotificationCount = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user as any;

    const filterId = user.isSubMerchant
      ? user.merchantId
      : user._id;

    const count =
      await NotificationService.getUnreadNotificationCountFromDB(
        filterId
      );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Unread notification count fetched successfully",
      data: {
        unreadCount: count,
      },
    });
  }
);
export const NotificationController = {
  getMyNotification,
  readMyNotifications,
  sendTestNotification,
  sendSalesRepActiveTestNotification,
  getUnreadNotificationCount
};
