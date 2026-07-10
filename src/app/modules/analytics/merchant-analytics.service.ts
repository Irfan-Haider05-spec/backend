import mongoose, { PipelineStage } from "mongoose";
import { User } from "../user/user.model";
import { Sell } from "../merchant/merchantSellManagement/merchantSellManagement.model";
import { AnalyticsFilters } from "./analytics.interface";

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

const getMerchantAnalytics = async (
  startDate?: string,
  endDate?: string,
  page: number = 1,
  limit: number = 10,
  filters?: AnalyticsFilters,
  userRole: string = "SUPER_ADMIN"
) => {
  const hideSensitive = userRole === "VIEW_ADMIN";

  const start = startDate ? new Date(startDate) : new Date("2000-01-01");
  const end = endDate ? new Date(endDate) : new Date();

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  const merchantMatch: Record<string, any> = {
    createdAt: { $gte: start, $lte: end },
    role: "MERCHANT",
  };

  if (filters?.paymentStatus) {
    merchantMatch.paymentStatus = filters.paymentStatus;
  }

  if (filters?.customerName) {
    merchantMatch.firstName = {
      $regex: filters.customerName,
      $options: "i",
    };
  }

  // ✅ FIX: ONLY ONE CITY FILTER (location → city)
  if (filters?.location) {
    merchantMatch.city = {
      $regex: filters.location.trim(),
      $options: "i",
    };
  }

  if (filters?.subscriptionStatus) {
    merchantMatch.subscription = filters.subscriptionStatus;
  }

  const skip = (page - 1) * limit;

  // ===================== RECORDS PIPELINE =====================
  const recordsPipeline: PipelineStage[] = [
    { $match: merchantMatch },

    {
      $lookup: {
        from: "sells",
        let: { merchantId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$merchantId", "$$merchantId"] },
                  { $eq: ["$status", "completed"] },
                ],
              },
            },
          },
        ],
        as: "sells",
      },
    },

    {
      $addFields: {
        totalRevenue: {
          $sum: {
            $map: {
              input: "$sells",
              as: "s",
              in: "$$s.totalBill",
            },
          },
        },

        pointsRedeemed: {
          $sum: {
            $map: {
              input: "$sells",
              as: "s",
              in: "$$s.pointRedeemed",
            },
          },
        },

        pointsEarned: {
          $sum: {
            $map: {
              input: "$sells",
              as: "s",
              in: "$$s.pointsEarned",
            },
          },
        },

        visit: { $size: "$sells" },
      },
    },

    {
      $project: {
        merchantId: "$_id",
        merchantName: "$firstName",
        subscriptionStatus: "$subscription",
        location: "$address",
        businessName: 1,
        customUserId: 1,
        email: 1,
        phone: 1,
        city: 1,
        paymentStatus: 1,

        totalRevenue: {
          $cond: {
            if: { $eq: [hideSensitive, true] },
            then: 0,
            else: "$totalRevenue",
          },
        },

        pointsEarned: 1,
        pointsRedeemed: 1,
        visit: 1,
        date: "$createdAt",
      },
    },

    { $sort: { totalRevenue: -1 } },
  ];

  if (limit > 0) {
    if (skip > 0) recordsPipeline.push({ $skip: skip });
    recordsPipeline.push({ $limit: limit });
  }

  // ===================== MONTHLY PIPELINE =====================
  const monthlyPipeline: PipelineStage[] = [
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        status: "completed",
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "merchantId",
        foreignField: "_id",
        as: "user",
      },
    },

    { $unwind: "$user" },

    // ✅ FIX: SINGLE CLEAN FILTER BLOCK
    {
      $match: {
        ...(filters?.paymentStatus && {
          "user.paymentStatus": filters.paymentStatus,
        }),

        ...(filters?.subscriptionStatus && {
          "user.subscription": filters.subscriptionStatus,
        }),

        ...(filters?.location && {
          "user.city": {
            $regex: filters.location.trim(),
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

    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
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
        monthName: {
          $arrayElemAt: [monthNames, { $subtract: ["$_id.month", 1] }],
        },

        totalRevenue: {
          $cond: {
            if: { $eq: [hideSensitive, true] },
            then: 0,
            else: "$totalRevenue",
          },
        },

        pointsEarned: 1,
        pointsRedeemed: 1,
        users: 1,
      },
    },
  ];

  // ===================== EXECUTION =====================
  const [records, totalResult, monthlyDataRaw] = await Promise.all([
    User.aggregate(recordsPipeline),
    User.countDocuments(merchantMatch),
    Sell.aggregate(monthlyPipeline),
  ]);

  const total = totalResult || 0;

  // ===================== FILL MONTHS =====================
  const filledMonthlyData: any[] = [];
  const cursor = new Date(start);
  cursor.setDate(1);

  while (cursor <= end) {
    const year = cursor.getFullYear();
    const month = cursor.getMonth() + 1;

    const found = monthlyDataRaw.find(
      (d) => d.year === year && d.month === month
    );

    filledMonthlyData.push({
      year,
      month,
      monthName: monthNames[month - 1],
      totalRevenue: hideSensitive ? 0 : found?.totalRevenue ?? 0,
      pointsEarned: found?.pointsEarned ?? 0,
      pointsRedeemed: found?.pointsRedeemed ?? 0,
      users: found?.users ?? 0,
    });

    cursor.setMonth(cursor.getMonth() + 1);
  }

  // ===================== RESPONSE =====================
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

const getMerchantAnalyticsExport = async (
  startDate?: string,
  endDate?: string,
  page: number = 1,
  limit: number = 10,
  filters?: AnalyticsFilters,
  userRole: string = "SUPER_ADMIN"
) => {
  const hideSensitive = userRole === "VIEW_ADMIN";

  const start = startDate ? new Date(startDate) : new Date("2000-01-01");
  const end = endDate ? new Date(endDate) : new Date();

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  // ===================== FIXED MERCHANT FILTER =====================
  const merchantMatch: Record<string, any> = {
    role: "MERCHANT",
    createdAt: { $gte: start, $lte: end },
  };

  // subscription
  if (filters?.subscriptionStatus) {
    merchantMatch.subscription = {
      $regex: filters.subscriptionStatus,
      $options: "i",
    };
  }

  // payment
  if (filters?.paymentStatus) {
    merchantMatch.paymentStatus = {
      $regex: filters.paymentStatus,
      $options: "i",
    };
  }

  // city OR location (UNIFIED FIX)
  if (filters?.city || filters?.location) {
    merchantMatch.city = {
      $regex: filters.city || filters.location,
      $options: "i",
    };
  }

  // name
  if (filters?.customerName) {
    merchantMatch.firstName = {
      $regex: filters.customerName,
      $options: "i",
    };
  }

  // ===================== STEP 1: GET MERCHANTS =====================
  const merchants = await User.find(merchantMatch)
    .select(
      "_id firstName lastName email phone city subscription paymentStatus customUserId createdAt"
    )
    .lean<any[]>();

  const merchantIds = merchants.map((m) => m._id);

  if (!merchantIds.length) return { records: [] };

  // ===================== STEP 2: SALES AGG =====================
  const salesAgg = await Sell.aggregate([
    {
      $match: {
        merchantId: { $in: merchantIds },
        createdAt: { $gte: start, $lte: end },
        status: "completed",
      },
    },
    {
      $group: {
        _id: "$merchantId",
        totalRevenue: { $sum: "$totalBill" },
        pointsEarned: { $sum: "$pointsEarned" },
        pointsRedeemed: { $sum: "$pointRedeemed" },
        visit: { $sum: 1 },
      },
    },
  ]);

  const salesMap = new Map();
  salesAgg.forEach((s) =>
    salesMap.set(s._id.toString(), {
      totalRevenue: s.totalRevenue,
      pointsEarned: s.pointsEarned,
      pointsRedeemed: s.pointsRedeemed,
      visit: s.visit,
    })
  );

  // ===================== STEP 3: MERGE =====================
  const records = merchants.map((m) => {
    const sales = salesMap.get(m._id.toString());

    return {
      merchantId: m._id.toString(),
      customUserId: m.customUserId,
      merchantName: `${m.firstName || ""} ${m.lastName || ""}`.trim(),
      email: m.email,
      phone: m.phone,
      location: m.city,

      subscriptionStatus: m.subscription,
      paymentStatus: m.paymentStatus,

      pointsAccumulated: sales?.pointsEarned || 0,
      totalRevenue: sales?.totalRevenue || 0,
      pointsEarned: sales?.pointsEarned || 0,

      pointsRedeemed: hideSensitive ? 0 : sales?.pointsRedeemed || 0,

      visit: sales?.visit || 0,
      date: m.createdAt,
    };
  });

  // ===================== SORT =====================
  records.sort((a, b) => b.totalRevenue - a.totalRevenue);

  // ===================== PAGINATION =====================
  if (limit > 0) {
    const skip = (page - 1) * limit;
    return {
      records: records.slice(skip, skip + limit),
    };
  }

  return { records };
};

const getMerchantAnalyticsMonthly = async (
  startDate?: string,
  endDate?: string,
  page: number = 1,
  limit: number = 10,
  filters?: AnalyticsFilters,
  userRole: string = "SUPER_ADMIN",
  merchantId?: string
) => {
  const hideSensitive = userRole === "VIEW_ADMIN";

  // ---------------- DATE RANGE ----------------
  const start = startDate ? new Date(startDate) : new Date("2000-01-01");
  const end = endDate ? new Date(endDate) : new Date();

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  if (!merchantId) {
    throw new Error("Merchant ID missing from token");
  }

  let merchantObjectId: mongoose.Types.ObjectId;

  try {
    merchantObjectId = new mongoose.Types.ObjectId(merchantId);
  } catch {
    throw new Error("Invalid Merchant ID");
  }

  // ---------------- MONTHLY AGGREGATION ----------------
  const monthlyRaw = await Sell.aggregate([
    {
      $match: {
        merchantId: merchantObjectId,
        status: { $in: ["completed", "COMPLETED", "success", "done"] },
        createdAt: { $gte: start, $lte: end },
      },
    },

    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },

        totalRevenue: { $sum: "$totalBill" },
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
        totalPointsRedeemed: hideSensitive
          ? { $literal: 0 }
          : "$totalPointsRedeemed",
        totalUsers: 1,
      },
    },

    { $sort: { year: 1, month: 1 } },
  ]);

  // ---------------- MAP ----------------
  const monthMap = new Map<string, any>(
    monthlyRaw.map((m) => [`${m.year}-${m.month}`, m])
  );

  // ---------------- FILL MONTHS ----------------
  const filledMonthlyData: any[] = [];

  const cursor = new Date(start);
  cursor.setDate(1);

  while (cursor <= end) {
    const year = cursor.getFullYear();
    const month = cursor.getMonth() + 1;

    const key = `${year}-${month}`;
    const found = monthMap.get(key);

    filledMonthlyData.push({
      year,
      month,
      monthName: monthNames[month - 1],

      totalRevenue: Number(found?.totalRevenue ?? 0),
      totalPointsAccumulated: Number(found?.totalPointsAccumulated ?? 0),
      totalPointsRedeemed: hideSensitive
        ? 0
        : Number(found?.totalPointsRedeemed ?? 0),
      totalUsers: Number(found?.totalUsers ?? 0),
    });

    cursor.setMonth(cursor.getMonth() + 1);
  }

  return {
    pagination: {
      page,
      limit,
      total: filledMonthlyData.length,
      totalPage: 1,
    },
    data: {
      monthlyData: filledMonthlyData,
    },
  };
};

export const MerchantAnalyticsService = {
  getMerchantAnalytics,
  getMerchantAnalyticsExport,
  getMerchantAnalyticsMonthly,
};
