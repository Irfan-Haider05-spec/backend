import { StatusCodes } from "http-status-codes";
import { User } from "../user/user.model";
import ApiError from "../../../errors/ApiErrors";
import QueryBuilder from "../../../utils/queryBuilder";
import { Subscription } from "../subscription/subscription.model";
import { Sell } from "../merchant/merchantSellManagement/merchantSellManagement.model";
import { DigitalCard } from "../customer/digitalCard/digitalCard.model";

const getAllCustomers = async (query: Record<string, unknown>) => {
  // ==============================
  // 1. Customer List
  // ==============================
  const baseQuery = User.find({
    role: "USER",
    isDeleted: false,
  }).select(
    "customUserId firstName lastName phone email status address referredInfo.referredBy subscription profile paymentStatus"
  );

  const allCustomersQuery = new QueryBuilder(baseQuery, query)
    .search([
      "firstName",
      "lastName",
      "email",
      "phone",
      "customUserId",
      "address",
    ])
    .filter()
    .paginate()
    .sort();

  const [allCustomers, pagination] = await Promise.all([
    allCustomersQuery.modelQuery.lean<any[]>(),
    allCustomersQuery.getPaginationInfo(),
  ]);

  const userIds = allCustomers.map((u) => u._id);

  // ==============================
  // 2. Latest Subscription
  // ==============================
  const subscriptions = await Subscription.find({
    user: { $in: userIds },
  })
    .populate("package", "title price")
    .sort({ currentPeriodEnd: -1 })
    .lean();

  const subscriptionMap: Record<string, any> = {};

  subscriptions.forEach((sub: any) => {
    const id = sub.user.toString();

    if (!subscriptionMap[id]) {
      subscriptionMap[id] = sub;
    }
  });

  // ==============================
  // 3. Points
  // ==============================
  const digitalCards = await DigitalCard.find({
    userId: { $in: userIds },
  }).lean();

  const pointsMap: Record<string, number> = {};

  digitalCards.forEach((card: any) => {
    const id = card.userId.toString();

    pointsMap[id] =
      (pointsMap[id] || 0) + (card.availablePoints || 0);
  });

  // ==============================
  // 4. Customer Sells
  // ==============================
  const sells = await Sell.find({
    userId: { $in: userIds },
    status: "completed",
  })
    .populate({
      path: "merchantId",
      select: "businessName",
    })
    .sort({ createdAt: -1 })
    .lean();

  const sellMap: Record<string, any[]> = {};
  const sellAmountMap: Record<string, number> = {};

  sells.forEach((sell: any) => {
    const userId = sell.userId.toString();

    if (!sellMap[userId]) {
      sellMap[userId] = [];
    }

    sellMap[userId].push({
      _id: sell._id,
      merchantName: sell.merchantId?.businessName || "",
      totalBill: sell.totalBill,
      discountedBill: sell.discountedBill,
      pointsEarned: sell.pointsEarned,
      pointRedeemed: sell.pointRedeemed,
      status: sell.status,
      createdAt: sell.createdAt,
      updatedAt: sell.updatedAt,
    });

    sellAmountMap[userId] =
      (sellAmountMap[userId] || 0) + (sell.totalBill || 0);
  });

  const now = new Date();

  // ==============================
  // 5. Final Response
  // ==============================
  const customersWithData = allCustomers.map((user: any) => {
    const subData = subscriptionMap[user._id.toString()] || null;

    const isActive =
      subData &&
      subData.status === "active" &&
      new Date(subData.currentPeriodEnd) > now;

    return {
      ...user,

      subscriptionData: subData
        ? {
            currentPeriodStart: subData.currentPeriodStart,
            currentPeriodEnd: subData.currentPeriodEnd,
            status: subData.status,
            price: subData.price,
            package: subData.package?.title || "",
          }
        : null,

      subscription: isActive ? "active" : "inActive",

      paymentStatus: user.paymentStatus || "unpaid",

      totalPoints: pointsMap[user._id.toString()] || 0,

      totalSellAmount: sellAmountMap[user._id.toString()] || 0,

      sells: sellMap[user._id.toString()] || [],

      sellsPagination: {
        total: sellMap[user._id.toString()]?.length || 0,
        limit: sellMap[user._id.toString()]?.length || 0,
        page: 1,
        totalPage: 1,
      },
    };
  });

  return {
    allcustomers: customersWithData,
    pagination,
  };
};

const getSingleCustomer = async (id: string) => {
  const user = await User.findOne({ _id: id, role: "USER" }).lean();

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Customer not found");
  }
  return user;
};

const updateCustomer = async (id: string, payload: Record<string, unknown>) => {
  const customer = await User.findOneAndUpdate(
    { _id: id, role: "USER" },
    payload,
    { new: true, runValidators: true }
  ).lean();

  if (!customer) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Customer not found");
  }

  return customer;
};

const deleteCustomer = async (id: string) => {
  const user = await User.findOneAndUpdate(
    {
      _id: id,
      role: "USER",
      isDeleted: false, // ensure already deleted users are not processed again
    },
    {
      $set: {
        status: "suspended", // optional: change status to indicate deletion
        isDeleted: true,
        deletedAt: new Date(),
      },
    },
    { new: true }
  ).lean();

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Customer not found");
  }

  return user;
};

const updateCustomerStatus = async (
  id: string,
  status: "active" | "inactive"
) => {
  const user = await User.findOneAndUpdate(
    { _id: id, role: "USER" },
    { status },
    { new: true }
  ).lean();

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Customer not found");
  }

  return user;
};

const getCustomerSellDetails = async (
  userId: string,
  query: Record<string, unknown>
) => {
  // ===============================
  // 🔥 Base Query
  // ===============================
  const baseQuery = Sell.find({
    userId,
    status: "completed",
  }).populate("merchantId", "firstName businessName email");

  // ===============================
  // 🔥 Query Builder Apply
  // ===============================
  const sellQuery = new QueryBuilder(baseQuery, query)
    .filter()
    .sort()
    .paginate();

  const [sells, pagination] = await Promise.all([
    sellQuery.modelQuery.lean<any[]>(),
    sellQuery.getPaginationInfo(),
  ]);

  // ===============================
  // 🔥 Format Data
  // ===============================
  const formattedSells = sells.map((sell) => ({
    sellId: sell._id,
    merchant: sell.merchantId,
    totalBill: sell.totalBill,
    discountedBill: sell.discountedBill,
    pointsEarned: sell.pointsEarned,
    pointRedeemed: sell.pointRedeemed,
    finalPoints:
      (sell.pointsEarned || 0) - (sell.pointRedeemed || 0),
    status: sell.status,
    date: sell.createdAt,
  }));

  return {
    data: formattedSells,
    pagination,
  };
};

export const AdminCustomerService = {
  getAllCustomers,
  getSingleCustomer,
  updateCustomer,
  deleteCustomer,
  updateCustomerStatus,
  getCustomerSellDetails,
};
