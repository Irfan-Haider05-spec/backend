
import ExcelJS from "exceljs";
import { Response } from "express";
import { Subscription } from "../subscription/subscription.model";
import { SalesRep } from "../salesRep/salesRep.model";
import { AnalyticsQueryOptions } from "./analytics.interface";

const getRevenuePerUser = async ({
  startDate,
  endDate,
  page = 1,
  limit = 10,
  forExport = false,
}: AnalyticsQueryOptions) => {
  const matchStage: Record<string, any> = {
    price: { $gt: 0 },
    trxId: { $exists: true },
    status: { $ne: "cancel" },
  };

  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  /* =====================================================
     🔥 SAFE PIPELINE (NO DATA LOSS)
  ===================================================== */
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
    /* 🔥 SAFE UNWIND (IMPORTANT FIX) */
    {
      $unwind: {
        path: "$user",
        preserveNullAndEmptyArrays: true, // 👈 FIXED
      },
    },
    /* 🔥 ADD DEBUG FLAG */
    {
      $addFields: {
        userExists: { $ne: ["$user", null] },
      },
    },
    {
      $group: {
        _id: "$user._id",
        customerId: { $first: "$user.customUserId" },
        customerName: { $first: "$user.firstName" },
        totalTransactions: { $sum: 1 },
        totalRevenue: { $sum: "$price" },
        firstTransaction: { $min: "$createdAt" },
        lastTransaction: { $max: "$createdAt" },
      },
    },
    {
      $project: {
        _id: 0,
        customerId: 1,
        customerName: 1,
        totalTransactions: 1,
        totalRevenue: 1,
        firstTransaction: 1,
        lastTransaction: 1,
      },
    },
    { $sort: { totalRevenue: -1 } },
  ];

  let totalCount = 0;

  /* =====================================================
     🔥 COUNT PIPELINE (SAFE)
  ===================================================== */
  if (!forExport) {
    const totalCountAgg = await Subscription.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          userExists: { $ne: ["$user", null] },
        },
      },
      { $group: { _id: "$user._id" } },
      { $count: "total" },
    ]);

    totalCount = totalCountAgg[0]?.total || 0;

    const skip = (page - 1) * limit;
    aggregationPipeline.push({ $skip: skip }, { $limit: limit });
  }

  /* =====================================================
     🔥 MAIN QUERY
  ===================================================== */
  const data = await Subscription.aggregate(aggregationPipeline);

  /* =====================================================
     🔥 RESPONSE
  ===================================================== */
  const pagination = !forExport
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
    data,
    pagination,
  };
};

const exportRevenuePerUser = async (
  res: Response,
  startDate?: string,
  endDate?: string
) => {
  const { data } = await getRevenuePerUser({ startDate, endDate, forExport: true });

  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ stream: res });
  const sheet = workbook.addWorksheet("Customer Revenue");

  sheet.columns = [
    { header: "Customer ID", key: "customerId", width: 25 },
    { header: "Customer Name", key: "customerName", width: 25 },
    { header: "Total Transactions", key: "totalTransactions", width: 20 },
    { header: "Total Revenue", key: "totalRevenue", width: 20 },
  ];

  data.forEach(row => sheet.addRow({
    ...row,
    firstTransaction: row.firstTransaction ? row.firstTransaction.toISOString() : "",
    lastTransaction: row.lastTransaction ? row.lastTransaction.toISOString() : "",
  }).commit());

  sheet.addRow({}).commit();
  sheet.addRow({
    customUserId: "TOTAL",
    totalTransactions: data.reduce((a, b) => a + b.totalTransactions, 0),
    totalRevenue: data.reduce((a, b) => a + b.totalRevenue, 0),
  }).commit();

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=customer-revenue.xlsx"
  );

  await sheet.commit();
  await workbook.commit();
};

const getCashCollectionAnalytics = async ({
  startDate,
  endDate,
  page = 1,
  limit = 10,
  forExport = false,
}: AnalyticsQueryOptions) => {
  const matchStage: Record<string, any> = {
    paymentStatus: "paid",
  };

  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  const aggregationPipeline: any[] = [
    { $match: matchStage },
    {
      $lookup: {
        from: "users",
        localField: "customerId",
        foreignField: "_id",
        as: "customer",
      },
    },
    { $unwind: "$customer" },
    {
      $group: {
        _id: "$customer._id",
        customerId: { $first: "$customer.customUserId" },
        salesRep: { $first: "$salesRepName" },
        totalTransactions: { $sum: 1 },
        totalReceived: { $sum: "$price" },
      },
    },
    {
      $project: {
        _id: 0,
        customerId: 1,
        salesRep: 1,
        totalTransactions: 1,
        totalReceived: 1,
      },
    },
    { $sort: { totalReceived: -1 } },
  ];

  let totalCount: number | undefined;

  if (!forExport) {
    // Count unique customers after grouping
    const totalCountAgg = await SalesRep.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "users",
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: "$customer" },
      { $group: { _id: "$customer._id" } },
      { $count: "total" },
    ]);
    totalCount = totalCountAgg[0]?.total || 0;

    const skip = (page - 1) * limit;
    aggregationPipeline.push({ $skip: skip }, { $limit: limit });
  }

  const data = await SalesRep.aggregate(aggregationPipeline);

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
    data,
    pagination,
  };
};

const exportCashCollectionAnalytics = async (
  res: Response,
  startDate?: string,
  endDate?: string
) => {
  const { data } = await getCashCollectionAnalytics({ startDate, endDate, forExport: true });

  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ stream: res });
  const sheet = workbook.addWorksheet("Cash Collection");

  sheet.columns = [
    { header: "Customer ID", key: "customerId", width: 25 },
    { header: "Sales Rep", key: "salesRep", width: 25 },
    { header: "Total Transactions", key: "totalTransactions", width: 22 },
    { header: "Total Received", key: "totalReceived", width: 20 },
  ];

  data.forEach(row => sheet.addRow(row));

  // Summary row
  sheet.addRow({});
  sheet.addRow({
    customUserId: "TOTAL",
    totalTransactions: data.reduce(
      (sum, row) => sum + row.totalTransactions,
      0
    ),
    totalReceived: data.reduce(
      (sum, row) => sum + row.totalReceived,
      0
    ),
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=cash-collection.xlsx"
  );

  await sheet.commit();
  await workbook.commit();
};

const getCashReceivableAnalytics = async ({
  startDate,
  endDate,
  page = 1,
  limit = 10,
  forExport = false,
}: AnalyticsQueryOptions) => {
  const matchStage: Record<string, any> = {
    paymentStatus: "unpaid",
    acknowledged: true,
  };

  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  const aggregationPipeline: any[] = [
    { $match: matchStage },
    {
      $lookup: {
        from: "users",
        localField: "customerId",
        foreignField: "_id",
        as: "customer",
      },
    },
    { $unwind: "$customer" },
    {
      $group: {
        _id: "$customer._id",
        customerId: { $first: "$customer.customUserId" },
        location: { $first: "$customer.address" },
        salesRep: { $first: "$salesRepName" },
        totalTransactions: { $sum: 1 },
        totalOutstanding: { $sum: "$price" },
      },
    },
    {
      $project: {
        _id: 0,
        customerId: 1,
        location: 1,
        salesRep: 1,
        totalTransactions: 1,
        totalOutstanding: 1,
      },
    },
    { $sort: { totalReceived: -1 } },
  ];

  let totalCount: number | undefined;

  if (!forExport) {
    // Count unique customers after grouping
    const totalCountAgg = await SalesRep.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "users",
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: "$customer" },
      { $group: { _id: "$customer._id" } },
      { $count: "total" },
    ]);
    totalCount = totalCountAgg[0]?.total || 0;

    const skip = (page - 1) * limit;
    aggregationPipeline.push({ $skip: skip }, { $limit: limit });
  }

  const data = await SalesRep.aggregate(aggregationPipeline);

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
    data,
    pagination,
  };
};

const exportCashReceivableAnalytics = async (
  res: Response,
  startDate?: string,
  endDate?: string
) => {
  // headers first
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=cash-receivable.xlsx"
  );

  const { data } = await getCashReceivableAnalytics({
    startDate,
    endDate,
    forExport: true,
  });

  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ stream: res });
  const sheet = workbook.addWorksheet("Cash Receivable");

  /* ---------- DATE RANGE (FIRST ROWS) ---------- */
  /* ---------- DATE RANGE (MERGED CELL) ---------- */
  if (startDate || endDate) {
    const text = `Date Range: ${startDate ? new Date(startDate).toDateString() : "All"
      } → ${endDate ? new Date(endDate).toDateString() : "All"
      }`;

    const row = sheet.addRow([text]);

    // 🔑 MERGE BEFORE COMMIT
    sheet.mergeCells(`A${row.number}:E${row.number}`);

    row.font = { bold: true };
    row.alignment = { horizontal: "center" };

    row.commit();
    sheet.addRow([]).commit();
  }

  /* ---------- DEFINE COLUMNS (NO AUTO HEADER) ---------- */
  sheet.columns = [
    { key: "customerId", width: 25 },
    { key: "location", width: 25 },
    { key: "salesRep", width: 25 },
    { key: "totalTransactions", width: 22 },
    { key: "totalOutstanding", width: 20 },
  ];

  /* ---------- MANUAL HEADER ROW ---------- */
  sheet.addRow([
    "Customer ID",
    "Location",
    "Sales Rep",
    "Total Transactions",
    "Total Outstanding",
  ]).commit();

  /* ---------- DATA ---------- */
  data.forEach(row => {
    sheet.addRow(row).commit();
  });

  /* ---------- SUMMARY ---------- */
  sheet.addRow([]).commit();
  sheet.addRow({
    customerId: "TOTAL",
    totalTransactions: data.reduce((s, r) => s + r.totalTransactions, 0),
    totalOutstanding: data.reduce((s, r) => s + r.totalOutstanding, 0),
  }).commit();

  await workbook.commit();
};

export const CashAnalyticsService = {
  getRevenuePerUser,
  exportRevenuePerUser,
  getCashCollectionAnalytics,
  exportCashCollectionAnalytics,
  getCashReceivableAnalytics,
  exportCashReceivableAnalytics,
};
