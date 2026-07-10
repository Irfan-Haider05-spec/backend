import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { SalesRepService } from "./salesRep.service";
import { JwtPayload } from "jsonwebtoken";

const createSalesRepData = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  await SalesRepService.createSalesRepData(user, req.body.packageId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Sales repo data created successfully",
  });
});
const getSalesRepData = catchAsync(async (req: Request, res: Response) => {
  const data = await SalesRepService.getSalesRepData(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Sales repo data retrieved successfully",
    data: data.salesRep,
    pagination: data.pagination,
  });
});

const updateUserAcknowledgeStatus = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    await SalesRepService.updateUserAcknowledgeStatus(req.params.id, user._id);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Acknowledge status updated successfully",
    });
  }
);
const generateToken = catchAsync(async (req: Request, res: Response) => {

  const data = await SalesRepService.generateToken(req.params.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Token generated successfully",
    data: data,
  });
});

const validateToken = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  await SalesRepService.validateToken(user._id, req.body.token);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Token validated  successfully",
  });
});



const activateAccount = catchAsync(async (req: Request, res: Response) => {
  await SalesRepService.activateAccount(req.params.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Account activated successfully",
  });
});



const deactivateAccount = catchAsync(async (req: Request, res: Response) => {
  await SalesRepService.deactivateAccount(req.params.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Account deactivated successfully",
  });
});
export const SalesRepController = {
  createSalesRepData,
  getSalesRepData,
  updateUserAcknowledgeStatus,
  generateToken,
  validateToken,
  activateAccount,
  deactivateAccount
};
