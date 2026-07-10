import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { DashboardService } from "./dashboard.service";


// Dashboard Stats

const getTotalRevenue = catchAsync(async (req: Request, res: Response) => {
  const data = await DashboardService.getTotalRevenue(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Total revenue fetched successfully",
    data: data,
  });
});
const getStatisticsForAdminDashboard = catchAsync(
  async (req: Request, res: Response) => {
    const range = (req.query.range as string) || "7d";
    const data = await DashboardService.getStatisticsForAdminDashboard(range);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Statistics fetched successfully",
      data: data,
    });
  }
);
const getYearlyRevenue = catchAsync(async (req: Request, res: Response) => {
  const data = await DashboardService.getYearlyRevenue(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Statistics fetched successfully",
    data: data,
  });
});

export const DashboardController = {
  getTotalRevenue,
  getStatisticsForAdminDashboard,
  getYearlyRevenue,
};
