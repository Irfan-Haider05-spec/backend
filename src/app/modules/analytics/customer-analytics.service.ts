import mongoose, { PipelineStage } from "mongoose";

import { Sell } from "../merchant/merchantSellManagement/merchantSellManagement.model";
import { AnalyticsFilters } from "./analytics.interface";
import ExcelJS from "exceljs";

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const getBusinessCustomerAnalytics = async (
  merchantId: string,
  startDate?: string,
  endDate?: string,
  page = 1,
  limit = 10,
  filters?: AnalyticsFilters,
  role?: string,
  isSubMerchant?: boolean,
  mainMerchantId?: string
) => {
  const effectiveMerchantId =
    isSubMerchant && mainMerchantId
      ? mainMerchantId
      : merchantId;

  /* ---------------- Base Match ---------------- */
  const matchSell: Record<string, any> = {
    merchantId: new mongoose.Types.ObjectId(effectiveMerchantId),
    status: "completed",
  };

  if (startDate && endDate) {
    matchSell.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  /* ---------------- Customer Filters ---------------- */
  const matchCustomer: Record<string, any> = {};

  if (filters?.subscriptionStatus) {
    matchCustomer["customer.subscription"] = filters.subscriptionStatus;
  }

  if (filters?.paymentStatus) {
    matchCustomer["customer.paymentStatus"] = filters.paymentStatus;
  }

  if (filters?.customerName) {
    matchCustomer["customer.firstName"] = {
      $regex: filters.customerName,
      $options: "i",
    };
  }

  /* ---------------- City Filter ---------------- */
  const cityValue = filters?.location; // 👈 frontend from location

  if (cityValue) {
    const city = cityValue.trim();
    const cityRegex = new RegExp(city, "i");

    matchCustomer["customer.city"] = {
      $regex: cityRegex,
    };
  }

  const customerMatchStage: PipelineStage[] = Object.keys(matchCustomer).length
    ? [{ $match: matchCustomer }]
    : [];

  const skip = (page - 1) * limit;

  /* =====================================================
     🔥 BASE PIPELINE
  ===================================================== */
  const basePipeline: PipelineStage[] = [
    { $match: matchSell },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "customer",
      },
    },
    { $unwind: "$customer" },
    ...customerMatchStage,
  ];

  /* ---------------- Records ---------------- */
  const recordsPipeline: PipelineStage[] = [
    ...basePipeline,
    {
      $project: {
        _id: 0,
        customerId: "$customer.customUserId",
        customerName: "$customer.firstName",
        subscriptionStatus: "$customer.subscription",
        paymentStatus: "$customer.paymentStatus",
        location: "$customer.address",
        city: "$customer.city",
        date: "$createdAt",
        revenue: "$discountedBill",
        pointsAccumulated: "$pointsEarned",
        pointsRedeemed: "$pointRedeemed",
      },
    },
    { $sort: { date: -1 } },
    { $skip: skip },
    { $limit: limit },
  ];

  const records = await Sell.aggregate(recordsPipeline);

  /* ---------------- Pagination Count ---------------- */
  const totalAgg = await Sell.aggregate([
    ...basePipeline,
    { $count: "total" },
  ]);

  const total = totalAgg[0]?.total ?? 0;

  /* ---------------- Monthly Aggregation ---------------- */
  const rawMonthly = await Sell.aggregate([
    ...basePipeline,
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        totalRevenue: { $sum: "$discountedBill" },
        totalPointsAccumulated: { $sum: "$pointsEarned" },
        totalPointsRedeemed: { $sum: "$pointRedeemed" },
        totalUsers: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        month: "$_id.month",
        monthName: {
          $arrayElemAt: [monthNames, { $subtract: ["$_id.month", 1] }],
        },
        totalRevenue: 1,
        totalPointsAccumulated: 1,
        totalPointsRedeemed: 1,
        totalUsers: 1,
      },
    },
    { $sort: { year: 1, month: 1 } },
  ]);

  /* ---------------- Fill Missing Months ---------------- */
  const monthMap = new Map(
    rawMonthly.map((m: any) => [`${m.year}-${m.month}`, m])
  );

  const filledMonthlyData: any[] = [];

  if (startDate && endDate) {
    const cursor = new Date(startDate);
    const end = new Date(endDate);

    cursor.setDate(1);

    while (cursor <= end) {
      const year = cursor.getFullYear();
      const month = cursor.getMonth() + 1;

      const data = monthMap.get(`${year}-${month}`);

      filledMonthlyData.push({
        year,
        month,
        monthName: monthNames[month - 1],
        totalRevenue: data?.totalRevenue || 0,
        totalPointsAccumulated: data?.totalPointsAccumulated || 0,
        totalPointsRedeemed: data?.totalPointsRedeemed || 0,
        totalUsers: data?.totalUsers || 0,
      });

      cursor.setMonth(cursor.getMonth() + 1);
    }
  }

  /* ---------------- Role Based Revenue Hiding ---------------- */
  const hideRevenueRoles = ["VIEW_MERCHANT"];

  if (hideRevenueRoles.includes(role as string)) {
    records.forEach((item) => delete item.revenue);
    filledMonthlyData.forEach((item) => delete item.totalRevenue);
  }

  return {
    pagination: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: {
      records,
      monthlyData: filledMonthlyData,
    },
  };
};

const exportBusinessCustomerAnalytics = async (
  merchantId: string,
  startDate?: string,
  endDate?: string,
  filters?: AnalyticsFilters
) => {
  /* ---------------- Base Match ---------------- */
  const matchSell: Record<string, any> = {
    merchantId: new mongoose.Types.ObjectId(merchantId),
    status: "completed",
  };

  if (startDate && endDate) {
    matchSell.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  /* ---------------- Customer Filters ---------------- */
  const matchCustomer: Record<string, any> = {};

  if (filters?.subscriptionStatus) {
    matchCustomer["customer.subscription"] = filters.subscriptionStatus;
  }

  if (filters?.customerName) {
    matchCustomer["customer.firstName"] = {
      $regex: filters.customerName,
      $options: "i",
    };
  }

  if (filters?.location) {
    matchCustomer["customer.address"] = {
      $regex: filters.location,
      $options: "i",
    };
  }

  const customerMatchStage =
    Object.keys(matchCustomer).length > 0
      ? [{ $match: matchCustomer }]
      : [];

  /* ---------------- Aggregation ---------------- */
  const records = await Sell.aggregate([
    { $match: matchSell },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "customer",
      },
    },
    { $unwind: "$customer" },
    ...customerMatchStage,
    {
      $project: {
        _id: 0,
        customerId: "$customer.customUserId",
        customerName: "$customer.firstName",
        subscriptionStatus: "$customer.subscription",
        location: "$customer.address",
        date: "$createdAt",
        revenue: "$discountedBill",
        pointsAccumulated: "$pointsEarned",
        pointsRedeemed: "$pointRedeemed",
      },
    },
    { $sort: { date: -1 } },
  ]);

  /* ---------------- Excel Generate ---------------- */
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Customer Analytics");

  worksheet.columns = [
    { header: "Customer ID", key: "customerId", width: 18 },
    { header: "Customer Name", key: "customerName", width: 25 },
    { header: "Subscription Status", key: "subscriptionStatus", width: 20 },
    { header: "Location", key: "location", width: 30 },
    { header: "Date", key: "date", width: 20 },
    { header: "Revenue", key: "revenue", width: 15 },
    { header: "Points Earned", key: "pointsAccumulated", width: 18 },
    { header: "Points Redeemed", key: "pointsRedeemed", width: 18 },
  ];

  records.forEach((item) => {
    worksheet.addRow({
      customerId: item.customerId,
      customerName: item.customerName,
      subscriptionStatus: item.subscriptionStatus,
      location: item.location,
      date: new Date(item.date).toISOString(),
      revenue: item.revenue,
      pointsAccumulated: item.pointsAccumulated,
      pointsRedeemed: item.pointsRedeemed,
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

const getCustomerAnalytics = async (
  startDate?: string,
  endDate?: string,
  page: number = 1,
  limit: number = 10,
  filters?: AnalyticsFilters,
  userRole: string = "MERCHANT"
) => {
  const hideSensitive = userRole === "VIEW_ADMIN";

  const start = startDate ? new Date(startDate) : new Date("2000-01-01");
  const end = endDate ? new Date(endDate) : new Date();

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  const skip = (page - 1) * limit;

  /* ================= BASE MATCH ================= */
  const baseMatch: any = {
    status: "completed",
    createdAt: { $gte: start, $lte: end },
  };

  /* =====================================================
     🔥 MAIN PIPELINE (RECORDS)
  ===================================================== */
  const basePipeline: PipelineStage[] = [
    { $match: baseMatch },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },

    /* ================= FILTERS ================= */
    {
      $match: {
        ...(filters?.paymentStatus && {
          "user.paymentStatus": {
            $regex: `^${filters.paymentStatus}$`,
            $options: "i",
          },
        }),
        ...(filters?.subscriptionStatus && {
          "user.subscription": filters.subscriptionStatus,
        }),
        ...(filters?.city && {
          "user.city": {
            $regex: `^${filters.city.trim()}$`,
            $options: "i",
          },
        }),
        ...(filters?.customerName && {
          "user.firstName": {
            $regex: `^${filters.customerName.trim()}$`,
            $options: "i",
          },
        }),
        ...(filters?.location && {
          "user.address": {
            $regex: filters.location,
            $options: "i",
          },
        }),
      },
    },

    /* ================= GROUP ================= */
    {
      $group: {
        _id: "$user._id",
        customUserId: { $first: "$user.customUserId" },
        customerName: { $first: "$user.firstName" },
        location: { $first: "$user.address" },
        subscriptionStatus: { $first: "$user.subscription" },
        paymentStatus: { $first: "$user.paymentStatus" },
        pointsEarned: { $sum: "$pointsEarned" },
        pointsRedeemed: { $sum: "$pointRedeemed" },
        totalRevenue: { $sum: "$totalBill" },
        visits: { $sum: 1 },
      },
    },

    /* ================= SAFE MASKING (REVENUE) ================= */
    {
      $addFields: {
        totalRevenueSafe: hideSensitive ? 0 : "$totalRevenue",
      },
    },

    /* ================= FINAL SHAPE ================= */
    {
      $project: {
        userId: "$_id",
        customUserId: 1,
        customerName: 1,
        location: 1,
        subscriptionStatus: 1,
        paymentStatus: 1,
        pointsEarned: 1,
        pointsRedeemed: 1,
        totalRevenue: "$totalRevenueSafe",
        visit: "$visits",
      },
    },

    { $sort: { totalRevenue: -1 } },
    { $skip: skip },
    { $limit: limit },
  ];

  /* =====================================================
     🔥 COUNT PIPELINE
  ===================================================== */
  const countPipeline: PipelineStage[] = [
    { $match: baseMatch },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $match: {
        ...(filters?.city && {
          "user.city": {
            $regex: `^${filters.city.trim()}$`,
            $options: "i",
          },
        }),
        ...(filters?.customerName && {
          "user.firstName": {
            $regex: `^${filters.customerName.trim()}$`,
            $options: "i",
          },
        }),
      },
    },
    { $group: { _id: "$user._id" } },
    { $count: "total" },
  ];

  /* =====================================================
     🔥 MONTHLY PIPELINE
  ===================================================== */
  const monthlyPipeline: PipelineStage[] = [
    { $match: baseMatch },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },

    /* ================= FIX: SAME FILTER LOGIC AS BASE ================= */
    {
      $match: {
        ...(filters?.paymentStatus && {
          "user.paymentStatus": {
            $regex: `^${filters.paymentStatus}$`,
            $options: "i",
          },
        }),
        ...(filters?.subscriptionStatus && {
          "user.subscription": filters.subscriptionStatus,
        }),
        ...(filters?.city && {
          "user.city": {
            $regex: `^${filters.city.trim()}$`,
            $options: "i",
          },
        }),
        ...(filters?.customerName && {
          "user.firstName": {
            $regex: `^${filters.customerName.trim()}$`,
            $options: "i",
          },
        }),
        ...(filters?.location && {
          "user.address": {
            $regex: filters.location,
            $options: "i",
          },
        }),
      },
    },

    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        totalRevenue: { $sum: "$totalBill" },
        pointsEarned: { $sum: "$pointsEarned" },
        pointsRedeemed: { $sum: "$pointRedeemed" },
        users: { $sum: 1 },
      },
    },

    /* ================= SAFE MASKING ================= */
    {
      $addFields: {
        totalRevenueSafe: hideSensitive ? 0 : "$totalRevenue",
      },
    },

    {
      $project: {
        _id: 0,
        year: "$_id.year",
        month: "$_id.month",
        monthName: {
          $arrayElemAt: [monthNames, { $subtract: ["$_id.month", 1] }],
        },
        totalRevenue: "$totalRevenueSafe",
        pointsEarned: 1,
        pointsRedeemed: 1,
        users: 1,
      },
    },
  ];

  /* =====================================================
     🔥 EXECUTE ALL
  ===================================================== */
  const [records, countResult, monthlyRaw] = await Promise.all([
    Sell.aggregate(basePipeline),
    Sell.aggregate(countPipeline),
    Sell.aggregate(monthlyPipeline),
  ]);

  const total = countResult[0]?.total || 0;

  /* =====================================================
     🔥 FILL MONTHS
  ===================================================== */
  const filledMonthly: any[] = [];
  const cursor = new Date(start);
  cursor.setDate(1);

  while (cursor <= end) {
    const year = cursor.getFullYear();
    const month = cursor.getMonth() + 1;

    const found = monthlyRaw.find(
      (m) => m.year === year && m.month === month
    );

    filledMonthly.push({
      year,
      month,
      monthName: monthNames[month - 1],
      totalRevenue: found?.totalRevenue || 0,
      pointsEarned: found?.pointsEarned || 0,
      pointsRedeemed: found?.pointsRedeemed || 0,
      users: found?.users || 0,
    });

    cursor.setMonth(cursor.getMonth() + 1);
  }

  const totalPage = Math.ceil(total / limit);

  return {
    pagination: {
      page,
      limit,
      total,
      totalPage,
    },
    data: {
      records,
      monthlyData: filledMonthly,
    },
  };
};

const getCustomerMonthlyReport = async (
  startDate?: string,
  endDate?: string,
  filters?: AnalyticsFilters,
  userRole: string = "MERCHANT"
) => {
  const hideSensitive = userRole === "VIEW_ADMIN";

  // Set date range
  const start = startDate ? new Date(startDate) : new Date("2000-01-01");
  const end = endDate ? new Date(endDate) : new Date();
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  // ── Build match filters for sells/users
  const match: Record<string, any> = {
    createdAt: { $gte: start, $lte: end },
    status: "completed",
  };

  if (filters?.paymentStatus) match.paymentStatus = { $regex: filters.paymentStatus, $options: "i" };
  if (filters?.subscriptionStatus) match["user.subscription"] = filters.subscriptionStatus;
  if (filters?.customerName) match["user.firstName"] = { $regex: filters.customerName, $options: "i" };
  if (filters?.location) match["user.address"] = { $regex: filters.location, $options: "i" };
  if (filters?.city) match["user.city"] = { $regex: filters.city, $options: "i" };

  // ── Aggregate monthly data
  const monthlyPipeline: PipelineStage[] = [
    // Join users
    { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
    { $unwind: "$user" },
    { $match: match },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        totalRevenue: { $sum: "$totalBill" },
        pointsRedeemed: { $sum: "$pointRedeemed" },
        pointsEarned: { $sum: "$pointsEarned" },
        users: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        month: "$_id.month",
        monthName: { $arrayElemAt: [monthNames, { $subtract: ["$_id.month", 1] }] },
        totalRevenue: 1,
        pointsRedeemed: hideSensitive ? { $literal: 0 } : "$pointsRedeemed",
        pointsEarned: 1,
        users: 1,
      },
    },
    { $sort: { year: 1, month: 1 } },
  ];

  const rawMonthly = await Sell.aggregate(monthlyPipeline);

  // ── Fill missing months
  const monthMap = new Map(rawMonthly.map((m) => [`${m.year}-${m.month}`, m]));
  const filledMonthlyData: any[] = [];
  const cursor = new Date(start);
  cursor.setDate(1);

  while (cursor <= end) {
    const year = cursor.getFullYear();
    const month = cursor.getMonth() + 1;
    const found = monthMap.get(`${year}-${month}`);

    filledMonthlyData.push({
      year,
      month,
      monthName: monthNames[month - 1],
      totalRevenue: found?.totalRevenue ?? 0,
      pointsEarned: found?.pointsEarned ?? 0,
      pointsRedeemed: found ? (hideSensitive ? 0 : found.pointsRedeemed) : 0,
      users: found?.users ?? 0,
    });

    cursor.setMonth(cursor.getMonth() + 1);
  }

  return { monthlyData: filledMonthlyData };
};

const exportCustomerAnalytics = async (
  startDate?: string,
  endDate?: string,
  filters?: AnalyticsFilters,
  userRole: string = "MERCHANT"
): Promise<Buffer> => {
  const hideSensitive = userRole === "VIEW_ADMIN";

  const start = startDate ? new Date(startDate) : new Date("2000-01-01");
  const end = endDate ? new Date(endDate) : new Date();

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  /* ================= BASE MATCH ================= */
  const baseMatch: any = {
    status: "completed",
    createdAt: { $gte: start, $lte: end },
  };

  /* ================= MAIN PIPELINE (FIXED) ================= */
  const pipeline: PipelineStage[] = [
    { $match: baseMatch },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },

    /* ================= FILTERS (SAME AS ANALYTICS) ================= */
    {
      $match: {
        ...(filters?.paymentStatus && {
          "user.paymentStatus": {
            $regex: `^${filters.paymentStatus}$`,
            $options: "i",
          },
        }),
        ...(filters?.subscriptionStatus && {
          "user.subscription": filters.subscriptionStatus,
        }),
        ...(filters?.city && {
          "user.city": {
            $regex: filters.city,
            $options: "i",
          },
        }),
        ...(filters?.location && {
          "user.address": {
            $regex: filters.location,
            $options: "i",
          },
        }),
        ...(filters?.customerName && {
          $or: [
            {
              "user.firstName": {
                $regex: filters.customerName,
                $options: "i",
              },
            },
            {
              "user.businessName": {
                $regex: filters.customerName,
                $options: "i",
              },
            },
          ],
        }),
      },
    },

    /* ================= GROUP ================= */
    {
      $group: {
        _id: "$user._id",
        customUserId: { $first: "$user.customUserId" },
        customerName: { $first: "$user.firstName" },
        location: { $first: "$user.address" },
        city: { $first: "$user.city" },
        subscriptionStatus: { $first: "$user.subscription" },
        paymentStatus: { $first: "$user.paymentStatus" },
        pointsEarned: { $sum: { $ifNull: ["$pointsEarned", 0] } },
        pointsRedeemed: { $sum: { $ifNull: ["$pointRedeemed", 0] } },
        totalRevenue: { $sum: { $ifNull: ["$totalBill", 0] } },
        visits: { $sum: 1 },
      },
    },

    /* ================= MASK ================= */
    {
      $addFields: {
        totalRevenue: hideSensitive ? 0 : "$totalRevenue",
      },
    },

    /* ================= FINAL OUTPUT ================= */
    {
      $project: {
        _id: 0,
        customUserId: 1,
        customerName: 1,
        location: 1,
        city: 1,
        subscriptionStatus: 1,
        paymentStatus: 1,
        pointsEarned: 1,
        pointsRedeemed: 1,
        totalRevenue: 1,
        visits: 1,
      },
    },

    { $sort: { totalRevenue: -1 } },
  ];

  const records = await Sell.aggregate(pipeline);

  /* ================= EXCEL ================= */
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Customer Analytics");

  sheet.columns = [
    { header: "Custom ID", key: "customUserId", width: 18 },
    { header: "Customer Name", key: "customerName", width: 25 },
    { header: "Location", key: "location", width: 35 },
    { header: "City", key: "city", width: 18 },
    { header: "Subscription", key: "subscriptionStatus", width: 15 },
    { header: "Payment Status", key: "paymentStatus", width: 18 },
    { header: "Points Accumulated", key: "pointsEarned", width: 18 },
    { header: "Points Redeemed", key: "pointsRedeemed", width: 18 },
    { header: "Revenue", key: "totalRevenue", width: 18 },
    { header: "Visits", key: "visits", width: 12 },
  ];

  records.forEach((r) => sheet.addRow(r));

  sheet.getRow(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer as ArrayBuffer);
};

export const CustomerAnalyticsService = {
  getBusinessCustomerAnalytics,
  exportBusinessCustomerAnalytics,
  getCustomerAnalytics,
  getCustomerMonthlyReport,
  exportCustomerAnalytics,
};
