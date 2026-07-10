import { User } from "../user/user.model";
import { USER_ROLES } from "../../../enums/user";
import QueryBuilder from "../../../utils/queryBuilder";
import { Rating } from "../customer/rating/rating.model";
import { Sell } from "../merchant/merchantSellManagement/merchantSellManagement.model";
import ExcelJS from "exceljs";

const exportMerchants = async (
  query: Record<string, unknown>,
  user: any
): Promise<Buffer> => {
  const {
    address,
    service,
    radius,
    ...rest
  } = query;

  const userId = user?._id;

  /* ---------------- User Location ---------------- */
  const userData = await User.findById(userId)
    .select("location")
    .lean();

  const userLocation = userData?.location;

  /* ---------------- Base Query ---------------- */
  let baseQuery = User.find({
    role: USER_ROLES.MERCHANT,
    verified: true,
  });

  /* ---------------- Address Filter ---------------- */
  if (address) {
    baseQuery = baseQuery.find({
      address: { $regex: address as string, $options: "i" },
    });
  }

  /* ---------------- Service Filter ---------------- */
  if (service) {
    const serviceWords = (service as string).split(/\s+|,/);

    baseQuery = baseQuery.find({
      $or: serviceWords.map((word) => ({
        service: { $regex: word, $options: "i" },
      })),
    });
  }

  /* ---------------- Radius Filter ---------------- */
  if (userLocation && radius) {
    baseQuery = baseQuery.find({
      location: {
        $geoWithin: {
          $centerSphere: [
            userLocation.coordinates,
            Number(radius) / 6378.1,
          ],
        },
      },
    });
  }

  /* ---------------- Query Builder ---------------- */
  const merchantsQuery = new QueryBuilder(baseQuery, {
    ...rest,
    limit: 100000, // 🚀 export e sob data lagbe
    page: 1,
  })
    .search([
      "firstName",
      "lastName",
      "email",
      "phone",
      "businessName",
      "service",
      "address",
      "customUserId",
      "country",
      "city",
    ])
    .filter()
    .sort();

  const merchants = await merchantsQuery.modelQuery.lean<any[]>();

  const merchantIds = merchants.map((m) => m._id);

  /* ---------------- Ratings ---------------- */
  const ratingsAgg = await Rating.aggregate([
    { $match: { merchantId: { $in: merchantIds } } },
    {
      $group: {
        _id: "$merchantId",
        avgRating: { $avg: "$rating" },
        ratingCount: { $sum: 1 },
      },
    },
  ]);

  const ratingMap = new Map();
  ratingsAgg.forEach((r) => {
    ratingMap.set(r._id.toString(), {
      rating: parseFloat(r.avgRating.toFixed(1)),
      ratingCount: r.ratingCount,
    });
  });

  /* ---------------- Sales ---------------- */
  const salesAgg = await Sell.aggregate([
    {
      $match: {
        merchantId: { $in: merchantIds },
        status: "completed",
      },
    },
    {
      $group: {
        _id: "$merchantId",
        totalRevenue: { $sum: "$totalBill" },
        totalTransactions: { $sum: 1 },
      },
    },
  ]);

  const salesMap = new Map();
  salesAgg.forEach((s) => {
    salesMap.set(s._id.toString(), {
      totalRevenue: s.totalRevenue,
      totalTransactions: s.totalTransactions,
    });
  });

  /* ---------------- Merge (NO CUSTOMER DATA) ---------------- */
  const finalMerchants = merchants.map((m) => {
    const id = m._id.toString();

    return {
      customUserId: m.customUserId,
      firstName: m.firstName,
      lastName: m.lastName,
      email: m.email,
      phone: m.phone,
      status: m.status,
      address: m.address,
      businessName: m.businessName,
      service: m.service,
      country: m.country,
      city: m.city,
      rating: ratingMap.get(id)?.rating || 0,
      ratingCount: ratingMap.get(id)?.ratingCount || 0,
      totalRevenue: salesMap.get(id)?.totalRevenue || 0,
      totalTransactions:
        salesMap.get(id)?.totalTransactions || 0,
      createdAt: m.createdAt
        ? new Date(m.createdAt).toLocaleString()
        : "",
    };
  });

  /* ---------------- Excel ---------------- */
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "The Pigeon Hub";

  const sheet = workbook.addWorksheet("Merchants");

  sheet.columns = [
    { header: "Merchant ID", key: "customUserId", width: 20 },
    { header: "First Name", key: "firstName", width: 20 },
    { header: "Last Name", key: "lastName", width: 20 },
    { header: "Email", key: "email", width: 30 },
    { header: "Phone", key: "phone", width: 18 },
    { header: "Status", key: "status", width: 15 },
    { header: "Business Name", key: "businessName", width: 25 },
    { header: "Service", key: "service", width: 25 },
    { header: "Country", key: "country", width: 20 },
    { header: "City", key: "city", width: 20 },
    { header: "Address", key: "address", width: 35 },
    { header: "Rating", key: "rating", width: 10 },
    { header: "Rating Count", key: "ratingCount", width: 15 },
    { header: "Total Revenue", key: "totalRevenue", width: 18 },
    { header: "Total Transactions", key: "totalTransactions", width: 20 },
    { header: "Created At", key: "createdAt", width: 22 },
  ];

  finalMerchants.forEach((m) => {
    sheet.addRow(m);
  });

  sheet.getRow(1).font = { bold: true };
  sheet.autoFilter = "A1:P1";

  /* ---------------- Buffer ---------------- */
  const buffer = await workbook.xlsx.writeBuffer();

  return Buffer.from(buffer as ArrayBuffer);
};

const exportCustomers = async (
  query: Record<string, unknown>
): Promise<Buffer> => {
  /* ---------------- Base Query ---------------- */
  const baseQuery = User.find({ role: "USER" }).select(
    "customUserId firstName lastName email phone status address createdAt"
  );

  /* ---------------- Query Builder ---------------- */
  const customersQuery = new QueryBuilder(baseQuery, {
    ...query,
    limit: 100000,
    page: 1,
  })
    .search([
      "firstName",
      "lastName",
      "email",
      "phone",
      "customUserId",
      "address",
    ])
    .filter()
    .sort();

  const customers = await customersQuery.modelQuery.lean<any[]>();

  const userIds = customers.map((u) => u._id);

  /* ---------------- Sell Aggregation (SUMMARY ONLY) ---------------- */
  const sellsAgg = await Sell.aggregate([
    {
      $match: {
        userId: { $in: userIds },
        status: "completed",
      },
    },
    {
      $group: {
        _id: "$userId",
        totalSellAmount: { $sum: "$totalBill" },
        totalTransactions: { $sum: 1 },
      },
    },
  ]);

  const sellMap = new Map();
  sellsAgg.forEach((s) => {
    sellMap.set(s._id.toString(), {
      totalSellAmount: s.totalSellAmount,
      totalTransactions: s.totalTransactions,
    });
  });

  /* ---------------- Format Data ---------------- */
  const finalCustomers = customers.map((c) => {
    const sellData = sellMap.get(c._id.toString());

    return {
      customUserId: c.customUserId,
      name: `${c.firstName || ""} ${c.lastName || ""}`.trim(),
      email: c.email,
      phone: c.phone,
      status: c.status,
      address: c.address,
      totalSellAmount: sellData?.totalSellAmount || 0,
      totalTransactions: sellData?.totalTransactions || 0,
      createdAt: c.createdAt
        ? new Date(c.createdAt).toLocaleString()
        : "",
    };
  });

  /* ---------------- Excel ---------------- */
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "The Pigeon Hub";

  const sheet = workbook.addWorksheet("Customers");

  sheet.columns = [
    { header: "Customer ID", key: "customUserId", width: 20 },
    { header: "Name", key: "name", width: 25 },
    { header: "Email", key: "email", width: 30 },
    { header: "Phone", key: "phone", width: 18 },
    { header: "Status", key: "status", width: 15 },
    { header: "Address", key: "address", width: 35 },
    { header: "Total Sell Amount", key: "totalSellAmount", width: 20 },
    { header: "Total Transactions", key: "totalTransactions", width: 20 },
    { header: "Created At", key: "createdAt", width: 22 },
  ];

  finalCustomers.forEach((c) => {
    sheet.addRow(c);
  });

  sheet.getRow(1).font = { bold: true };
  sheet.autoFilter = "A1:I1";

  /* ---------------- Buffer ---------------- */
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer as ArrayBuffer);
};

export const AdminAnalyticsService = {
  exportMerchants,
  exportCustomers,
};
