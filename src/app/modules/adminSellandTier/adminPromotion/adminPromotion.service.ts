import QueryBuilder from "../../../../utils/queryBuilder";

import { DigitalCard } from "../../customer/digitalCard/digitalCard.model";
import { Rating } from "../../customer/rating/rating.model";
import { User } from "../../user/user.model";
import { Tier } from "../point&TierSystem/tierAdmin.model";
import { IPromotion } from "./adminPromotion.interface";
import { PromotionAdmin } from "./adminPromotion.model";
import { Promotion } from "../../merchant/promotionMerchant/promotionMerchant.model";

import { Types } from "mongoose";
import { Sell } from "../../merchant/merchantSellManagement/merchantSellManagement.model";

/* ✅ SHARED UTILS */
import { getUserSegment } from "../../../../shared/promotion/userSegment.util";
import { getUserTier } from "../../../../shared/promotion/tier.util";

/* ================= CREATE ================= */
const createPromotionToDB = async (payload: Partial<IPromotion>) => {
  if (!payload.cardId) {
    payload.cardId = `AP-${Math.floor(
      100000 + Math.random() * 900000
    )}`;
  }

  const promotion = new PromotionAdmin(payload);
  return promotion.save();
};

/* ================= UPDATE ================= */
const updatePromotionToDB = async (
  id: string,
  payload: Partial<IPromotion>
) => {
  return PromotionAdmin.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
};

/* ================= DELETE ================= */
const deletePromotionFromDB = async (id: string) => {
  return PromotionAdmin.findByIdAndDelete(id);
};

/* ================= GET ALL PROMOTIONS ================= */
const getAllPromotionsFromDB = async (query: any = {}) => {
  const queryBuilder = new QueryBuilder(
    PromotionAdmin.find({})
      .populate("createdBy", "firstName lastName email"),
    query
  );

  queryBuilder.search(["name"]).filter().sort().paginate().fields();

  const promotions = await queryBuilder.modelQuery;
  const pagination = await queryBuilder.getPaginationInfo();

  return { promotions, pagination };
};

/* ================= GET SINGLE ================= */
const getSinglePromotionFromDB = async (id: string) => {
  return PromotionAdmin.findById(id).populate(
    "createdBy",
    "firstName lastName email"
  );
};

/* ================= TOGGLE STATUS ================= */
const togglePromotionInDB = async (id: string) => {
  const promotion = await PromotionAdmin.findById(id);

  if (!promotion) return null;

  promotion.status =
    promotion.status === "active" ? "inactive" : "active";

  return promotion.save();
};

/* ================= POPULAR MERCHANTS ================= */
const getPopularMerchantsFromDB = async () => {
  const result = await Rating.aggregate([
    {
      $group: {
        _id: "$merchantId",
        avgRating: { $avg: "$rating" },
        totalRatings: { $sum: 1 },
      },
    },
    { $sort: { avgRating: -1, totalRatings: -1 } },
    { $limit: 20 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "merchant",
      },
    },
    { $unwind: "$merchant" },
    {
      $project: {
        _id: 1,
        avgRating: { $round: ["$avgRating", 2] },
        totalRatings: 1,
        merchant: {
          name: "$merchant.firstName",
          email: "$merchant.email",
          profile: "$merchant.profile",
        },
      },
    },
  ]);

  return result.length ? result : [];
};

/* ================= MERCHANT DETAILS ================= */
const getDetailsOfMerchant = async (merchantId: string) => {
  const merchant = await User.findById(merchantId)
    .select(
      "firstName location profile photo about website address"
    )
    .lean();

  const promotions = await PromotionAdmin.find({
    merchantId,
  }).lean();

  return {
    merchant,
    promotions,
  };
};

/* ================= USER TIER ================= */
const getUserTierOfMerchant = async (
  userId: string,
  merchantId: string
) => {
  const digitalCard = await DigitalCard.findOne({
    userId,
    merchantId,
  });

  const availablePoints = digitalCard?.availablePoints ?? 0;

  const spendAgg = await Sell.aggregate([
    {
      $match: {
        userId: new Types.ObjectId(userId),
        merchantId: new Types.ObjectId(merchantId),
        status: "completed",
      },
    },
    {
      $group: {
        _id: null,
        totalSpend: { $sum: "$totalBill" },
      },
    },
  ]);

  const totalSpend = spendAgg[0]?.totalSpend || 0;

  const tiers = await Tier.find({
    admin: merchantId,
  }).sort({
    pointsThreshold: 1,
  });

  /* ✅ SHARED UTIL USED */
  const userTier = getUserTier(
    tiers,
    availablePoints,
    totalSpend
  );

  return {
    availablePoints,
    totalSpend,
    tierName: userTier?.name || null,
    rewardText: userTier?.reward || null,
  };
};

/* ================= CATEGORY BASED PROMO ================= */
const getPromotionsByUserCategory = async (
  categoryName: string
) => {
  if (!categoryName)
    throw new Error("Category name is required");

  const merchants = await User.find(
    {
      service: {
        $regex: new RegExp(categoryName, "i"),
      },
    },
    { _id: 1 }
  );

  if (!merchants.length) return [];

  const merchantIds = merchants.map((m) => m._id);

  return PromotionAdmin.find({
    merchantId: { $in: merchantIds },
  }).sort({ createdAt: -1 });
};

/* ================= MERCHANT PROMOTIONS ================= */
const getAllPromotionsOfAMerchant = async (
  merchantId: string,
  query: any = {}
) => {
  const queryBuilder = new QueryBuilder(
    PromotionAdmin.find({ merchantId })
      .populate("merchantId", "website")
      .populate("createdBy", "firstName lastName email"),
    query
  );

  queryBuilder.search(["name"]).filter().sort().paginate().fields();

  const promotions = await queryBuilder.modelQuery;
  const pagination = await queryBuilder.getPaginationInfo();

  return {
    promotions,
    pagination,
  };
};

/* ================= USER PROMOTIONS ================= */
const getPromotionsForUserFromDB = async (
  userId: string
) => {
  /* ✅ SHARED UTIL USED */
  const userSegment = await getUserSegment(userId);

  return Promotion.find({
    customerSegment: {
      $in: [userSegment, "all_customer"],
    },
    status: "active",
  }).populate("merchantId", "website name");
};

/* ================= EXPORT ================= */
export const PromotionAdminService = {
  createPromotionToDB,
  updatePromotionToDB,
  deletePromotionFromDB,
  getAllPromotionsFromDB,
  getSinglePromotionFromDB,
  togglePromotionInDB,
  getPopularMerchantsFromDB,
  getDetailsOfMerchant,
  getUserTierOfMerchant,
  getPromotionsByUserCategory,
  getAllPromotionsOfAMerchant,
  getPromotionsForUserFromDB,
};