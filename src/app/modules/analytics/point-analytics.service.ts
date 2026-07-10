
import ExcelJS from "exceljs";
import { Response } from "express";
import PointTransaction from "../pointTransaction/pointTransaction.model";
import { AnalyticsQueryOptions } from "./analytics.interface";

const getPointRedeemedAnalytics = async ({
  startDate,
  endDate,
  page = 1,
  limit = 10,
  forExport = false,
}: AnalyticsQueryOptions) => {
  const matchStage: Record<string, any> = {
    type: "REDEEM",
  };

  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  // Base aggregation
  const aggregationPipeline: any[] = [
    { $match: matchStage },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $group: {
        _id: "$user._id",
        customerId: { $first: "$user.customUserId" },
        customerName: { $first: "$user.firstName" },
        totalPointsRedeemed: { $sum: "$points" },
        redemptionCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        customerId: 1,
        customerName: 1,
        totalPointsRedeemed: 1,
        redemptionCount: 1,
      },
    },
    { $sort: { totalPointsRedeemed: -1 } },
  ];

  let totalCount: number | undefined;

  // Pagination only if not exporting
  if (!forExport) {
    const totalCountAgg = await PointTransaction.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $group: { _id: "$user._id" } },
      { $count: "total" },
    ]);
    totalCount = totalCountAgg[0]?.total || 0;

    const skip = (page - 1) * limit;
    aggregationPipeline.push({ $skip: skip }, { $limit: limit });
  }

  const result = await PointTransaction.aggregate(aggregationPipeline);

  const pagination = !forExport && totalCount !== undefined
    ? {
      total: totalCount,
      limit,
      page,
      totalPage: Math.ceil(totalCount / limit),
    }
    : undefined;

  return {
    timeRange: {
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    },
    data: result,
    pagination,
  };
};

const exportPointRedeemedAnalytics = async (res: Response, startDate?: string, endDate?: string) => {
  const { data } = await getPointRedeemedAnalytics({ startDate, endDate, forExport: true });

  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ stream: res });
  const sheet = workbook.addWorksheet("Point Redeemed");

  sheet.columns = [
    { header: "Customer ID", key: "customerId", width: 25 },
    { header: "Customer Name", key: "customerName", width: 25 },
    { header: "Total Points Redeemed", key: "totalPointsRedeemed", width: 20 },
    { header: "Redemption Count", key: "redemptionCount", width: 20 },
  ];

  data.forEach(row => sheet.addRow(row));

  sheet.addRow({}).commit();
  sheet.addRow({
    customUserId: "TOTAL",
    totalPointsRedeemed: data.reduce((a, b) => a + b.totalPointsRedeemed, 0),
    redemptionCount: data.reduce((a, b) => a + b.redemptionCount, 0),
  }).commit();

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=point-redeemed.xlsx"
  );

  await sheet.commit();
  await workbook.commit();
};

export const PointAnalyticsService = {
  getPointRedeemedAnalytics,
  exportPointRedeemedAnalytics,
};
