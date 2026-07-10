import { Subscription } from "../subscription/subscription.model";
import { User } from "../user/user.model";
import { USER_ROLES, USER_STATUS } from "../../../enums/user";


import mongoose, { Types } from "mongoose";


import { Sell } from "../merchant/merchantSellManagement/merchantSellManagement.model";
import { Promotion } from "../merchant/promotionMerchant/promotionMerchant.model";


const getTotalRevenue = async (query: any) => {
  const startDate = new Date(query.start);
  const endDate = new Date(query.end);
  const revenueData = await Subscription.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        revenue: { $sum: "$price" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
    {
      $project: {
        _id: 0,
        month: {
          $concat: [
            {
              $arrayElemAt: [
                [
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
                ],
                { $subtract: ["$_id.month", 1] },
              ],
            },
            " ",
            { $toString: "$_id.year" },
          ],
        },
        revenue: 1,
      },
    },
  ]);

  // 2️⃣ Generate all months in range
  const allMonths: string[] = [];
  let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

  while (current <= end) {
    const monthStr = `${[
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
      ][current.getMonth()]
      } ${current.getFullYear()}`;
    allMonths.push(monthStr);
    current.setMonth(current.getMonth() + 1);
  }

  // 3️⃣ Merge aggregation result with all months, fill 0 for missing
  const revenueMap = revenueData.reduce((acc, item) => {
    acc[item.month] = item.revenue;
    return acc;
  }, {} as Record<string, number>);

  const finalData = allMonths.map((month) => ({
    month,
    revenue: revenueMap[month] || 0,
  }));

  return finalData;
};

const getStatisticsForAdminDashboard = async (range: string) => {
  const now = new Date();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const ranges: Record<string, Date | undefined> = {
    today: todayStart,
    "7d": new Date(now.setDate(now.getDate() - 7)),
    "30d": new Date(now.setDate(now.getDate() - 30)),
    all: undefined,
  };

  const startDate = range === "all" ? undefined : ranges[range] ?? ranges["7d"];

  const matchStage: any = {};
  if (startDate) matchStage.createdAt = { $gte: startDate };

  const [revenueResult, customerCount, providerCount, pendingApprovals] =
    await Promise.all([
      Subscription.aggregate([
        {
          $match: matchStage,
        },
        { $group: { _id: null, totalRevenue: { $sum: "$price" } } },
      ]),

      User.countDocuments({
        role: USER_ROLES.USER,
        ...(startDate ? { createdAt: { $gte: startDate } } : {}),
      }),

      User.countDocuments({
        role: USER_ROLES.MERCHANT,
        ...(startDate ? { createdAt: { $gte: startDate } } : {}),
      }),

      User.countDocuments({
        role: USER_ROLES.MERCHANT,
        status: USER_STATUS.INACTIVE,
        ...(startDate ? { createdAt: { $gte: startDate } } : {}),
      }),
    ]);

  return {
    range,
    customers: customerCount,
    providers: providerCount,
    pendingApprovals,
    subscriptionRevenue: revenueResult[0]?.totalRevenue || 0,
  };
};

const getYearlyRevenue = async (query: any) => {
  const startDate = query.start ? new Date(query.start) : undefined;
  const endDate = query.end ? new Date(query.end) : undefined;
  const matchStage: Record<string, any> = {};

  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = startDate;
    if (endDate) matchStage.createdAt.$lte = endDate;
  }

  // Aggregate revenue by year
  const revenueData = await Subscription.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { year: { $year: "$createdAt" } },
        totalRevenue: { $sum: "$price" },
      },
    },
    { $sort: { "_id.year": 1 } },
  ]);

  // Determine start and end year
  const years = revenueData.map((r) => r._id.year);
  const minYear = startDate ? startDate.getFullYear() : Math.min(...years);
  const maxYear = endDate ? endDate.getFullYear() : Math.max(...years);

  // Fill missing years with 0 revenue
  const result: { year: number; totalRevenue: number }[] = [];
  for (let y = minYear; y <= maxYear; y++) {
    const yearData = revenueData.find((r) => r._id.year === y);
    result.push({
      year: y,
      totalRevenue: yearData?.totalRevenue || 0,
    });
  }

  return result;
};

const getReportForMerchantDashboard = async (
  merchantId: string,
  range: string = "7d"
) => {
  const today = new Date();
  let startDate: Date;

  switch (range) {
    case "today":
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      break;
    case "7d":
      startDate = new Date();
      startDate.setDate(today.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "1m":
      startDate = new Date();
      startDate.setMonth(today.getMonth() - 1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "3m":
      startDate = new Date();
      startDate.setMonth(today.getMonth() - 3);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "all":
      startDate = new Date(0);
      break;
    default:
      startDate = new Date();
      startDate.setDate(today.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      break;
  }

  const dateFilter = { $gte: startDate, $lte: today };

  // 1️⃣ Total Members
  const buyersQuery: any = {
    merchantId: new mongoose.Types.ObjectId(merchantId),
    userId: { $ne: null },
    createdAt: dateFilter,
    status: "completed",
  };

  const buyers = await Sell.distinct("userId", buyersQuery);
  const totalMembers = buyers.length;

  // 2️⃣ Rewards Redeemed (sum of pointRedeemed)
  const redeemedAgg = await Sell.aggregate([
    {
      $match: {
        merchantId: new mongoose.Types.ObjectId(merchantId),
        createdAt: dateFilter,
        status: "completed",
      },
    },
    {
      $group: {
        _id: null,
        totalRedeemed: { $sum: "$pointRedeemed" },
      },
    },
  ]);

  const rewardsRedeemed = redeemedAgg[0]?.totalRedeemed || 0;

  // 3️⃣ Total Points Issued
  const pointsAgg = await Sell.aggregate([
    {
      $match: {
        merchantId: new mongoose.Types.ObjectId(merchantId),
        createdAt: dateFilter,
        status: "completed",
      },
    },
    {
      $group: {
        _id: null,
        totalPoints: { $sum: "$pointsEarned" },
      },
    },
  ]);

  const totalPointsIssued = pointsAgg[0]?.totalPoints || 0;

  // 4️⃣ Total Sales
  const salesAgg = await Sell.aggregate([
    {
      $match: {
        merchantId: new mongoose.Types.ObjectId(merchantId),
        createdAt: dateFilter,
        status: "completed",
      },
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: "$totalBill" },
      },
    },
  ]);

  const totalSales = salesAgg[0]?.totalSales || 0;

  return {
    range,
    totalSales,
    totalMembers,
    totalPointsIssued,
    rewardsRedeemed, // now sum of pointRedeemed
  };
};

const getWeeklySellReport = async (merchantId: string) => {
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setHours(0, 0, 0, 0);
  sevenDaysAgo.setDate(today.getDate() - 6); // last 7 days

  // last 7 days Sell fetch + daily total
  const data = await Sell.aggregate([
    {
      $match: {
        merchantId: new mongoose.Types.ObjectId(merchantId),
        createdAt: { $gte: sevenDaysAgo, $lte: today },
        status: "completed", 
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        totalSell: { $sum: "$totalBill" },
        totalOrders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  let totalSell = 0;

  const result: any[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(today.getDate() - (6 - i));
    const formatted = date.toISOString().split("T")[0];
    const dayName = dayNames[date.getDay()];

    const found = data.find((d) => d._id === formatted);
    const dailySell = found?.totalSell || 0;
    totalSell += dailySell;

    result.push({
      day: dayName,
      totalSell: dailySell,
      totalOrders: found?.totalOrders || 0,
    });
  }

  // percentage calculation
  const finalResult = result.map((day) => ({
    ...day,
    percentage:
      totalSell > 0
        ? Number(((day.totalSell / totalSell) * 100).toFixed(2))
        : 0,
  }));

  return {
    totalSell, // last 7 days total
    weeklyReport: finalResult,
  };
};

const getTodayNewMembers = async (merchantId: string) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // Fetch giftcards bought today
  const promoshonCard = await Promotion.find({
    merchantId: new mongoose.Types.ObjectId(merchantId),
    createdAt: { $gte: todayStart, $lte: todayEnd },
  })
    .sort({ createdAt: -1 })
    .lean();

  return promoshonCard.map((gc) => ({
    giftCardId: gc._id,
    title: gc.name,
    user: null,
    discountPercentage: gc.discountPercentage || 0,
    boughtAt: gc,
  }));
};

const getCustomerChart = async (merchantId: string, year?: number) => {
  const currentYear = year || new Date().getFullYear();

  const matchStage = {
    merchantId: new mongoose.Types.ObjectId(merchantId),
     status: "completed",
    $expr: {
      $eq: [{ $year: "$createdAt" }, currentYear],
    },
  };

  const pipeline = [
    { $match: matchStage },

    {
      $group: {
        _id: { month: { $month: "$createdAt" } },
        totalRevenue: { $sum: "$totalBill" },
        totalDiscount: {
          $sum: { $subtract: ["$totalBill", "$discountedBill"] },
        },
      },
    },

    { $sort: { "_id.month": 1 } as any },
  ];

  const data = await Sell.aggregate(pipeline);

  const MONTH_NAMES = [
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
  // Ensure all 12 months exist
  const formatted = Array.from({ length: 12 }, (_, idx) => {
    const monthNum = idx + 1;
    const monthData = data.find((d) => d._id.month === monthNum);

    return {
      month: MONTH_NAMES[idx],
      totalRevenue: monthData?.totalRevenue || 0,
      totalDiscount: monthData?.totalDiscount || 0,
    };
  });

  return formatted;
};


const getCustomerChartWeek = async (
  merchantId: string,
  startDate: string,
  endDate: string
) => {
  if (!startDate || !endDate) {
    throw new Error("Start date and end date are required");
  }

  const from = new Date(`${startDate}T00:00:00Z`);
  const to = new Date(`${endDate}T23:59:59Z`);

  const pipeline = [
    {
      $match: {
        merchantId: new Types.ObjectId(merchantId),
        createdAt: { $gte: from, $lte: to },
        status: "completed", // optional if you only want completed orders
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        totalRevenue: { $sum: "$totalBill" },
        totalDiscount: { $sum: { $subtract: ["$totalBill", "$discountedBill"] } },
      },
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
        "_id.day": 1,
      },
    },
  ] as any;

  const data = await Sell.aggregate(pipeline);

  const days: { date: string; revenue: number; discount: number }[] = [];
  const current = new Date(from);

  while (current <= to) {
    const y = current.getUTCFullYear();
    const m = current.getUTCMonth() + 1;
    const d = current.getUTCDate();

    const found = data.find(
      (item) =>
        item._id.year === y &&
        item._id.month === m &&
        item._id.day === d
    );

    days.push({
      date: current.toISOString().slice(0, 10),
      revenue: found?.totalRevenue || 0,
      discount: found?.totalDiscount || 0,
    });

    current.setUTCDate(current.getUTCDate() + 1);
  }

  return days;
};



export const DashboardMerchantService = {
  getReportForMerchantDashboard,
  getWeeklySellReport,
  getTotalRevenue,
  getStatisticsForAdminDashboard,
  getYearlyRevenue,
  getTodayNewMembers,
  getCustomerChart,
  getCustomerChartWeek,
};
