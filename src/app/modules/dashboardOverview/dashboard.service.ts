import { Subscription } from "../subscription/subscription.model";
import { User } from "../user/user.model";
import { USER_ROLES, USER_STATUS } from "../../../enums/user";

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
    const monthStr = `${
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

  // Start of today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Start of this month
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Start of this year
  const yearStart = new Date(now.getFullYear(), 0, 1);

  // Start of last 1,7,30 days
  const last1Day = new Date();
  last1Day.setDate(now.getDate() - 1);
  last1Day.setHours(0, 0, 0, 0);

  const last7Days = new Date();
  last7Days.setDate(now.getDate() - 7);

  const last30Days = new Date();
  last30Days.setDate(now.getDate() - 30);

  const ranges: Record<string, Date | undefined> = {
    "1d": last1Day,
    "7d": last7Days,
    "30d": last30Days,
    today: todayStart,
    month: monthStart,
    year: yearStart,
    all: undefined,
  };
  const startDate = range === "all" ? undefined : ranges[range];


  // const startDate = ranges[range] ?? ranges["7d"];

  // Build match stage
  const matchStage: any = {};
  if (startDate) matchStage.createdAt = { $gte: startDate };

  const [revenueResult, customerCount, providerCount, pendingApprovals] =
    await Promise.all([
      Subscription.aggregate([
        { $match: matchStage },
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
export const DashboardService = {
  getTotalRevenue,
  getStatisticsForAdminDashboard,
  getYearlyRevenue,
};
