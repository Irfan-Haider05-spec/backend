import mongoose from "mongoose";

import { User } from "../../user/user.model";
import QueryBuilder from "../../../../utils/queryBuilder";
import { Promotion } from "../promotionMerchant/promotionMerchant.model";
import { DigitalCard } from "../../customer/digitalCard/digitalCard.model";
import ApiError from "../../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
import { Tier } from "../point&TierSystem/tier.model";

const getAllMembers = async (
  merchantId: string,
  query: Record<string, any>
) => {
  // 1️⃣ Get unique buyer IDs from DigitalCard (correct source)
  const buyerIds = await DigitalCard.distinct("userId", {
    merchantId: new mongoose.Types.ObjectId(merchantId),
  });

  if (!buyerIds.length) {
    return {
      members: [],
      pagination: {
        total: 0,
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 20,
        pages: 0,
      },
    };
  }

  // 2️⃣ Query Builder for members
  const qb = new QueryBuilder(
    User.find({ _id: { $in: buyerIds } }).select("firstName location status "),
    query
  )
    .search(["firstName", "lastName", "email", "phone"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const members = await qb.modelQuery.lean();
  const pagination = await qb.getPaginationInfo();

  // 3️⃣ Get digital cards for these users under this merchant
  const digitalCards = await DigitalCard.find({
    userId: { $in: buyerIds },
    merchantId,
  })
    .select("cardCode availablePoints promotions")
    .lean();

  // 4️⃣ Attach cards to each member
  const membersWithCards = members.map((member) => ({
    ...member,
    digitalCards: digitalCards.filter(
      (dc) =>
        (dc.userId && dc.userId.toString()) === (member._id as any).toString()
    ),
  }));

  return {
    members: membersWithCards,
    pagination,
  };
};

const getSingleMember = async (merchantId: string, userId: string) => {
  // Check if user bought gift card from merchant
  const bought = await Promotion.findOne({
    merchantId: new mongoose.Types.ObjectId(merchantId),
    userId: new mongoose.Types.ObjectId(userId),
  });

  if (!bought) return null;

  const member = await User.findById(userId)
    .select("firstName lastName email phone")
    .lean();

  const digitalCards = await DigitalCard.find({ userId, merchantId })
    .select("uniqueId totalPoints expiry")
    .lean();

  return {
    ...member,
    digitalCards,
  };
};


const getSingleMemberTier = async (
  merchantId: string,
  userId: string
) => {
  // Find logged-in merchant
  const merchant = await User.findById(merchantId).select(
    "_id merchantId isSubMerchant"
  );

  if (!merchant) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Merchant not found");
  }

  // Resolve root merchant id
  let rootMerchantId: string;

  if (merchant.isSubMerchant) {
    if (!merchant.merchantId) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Parent merchant not found"
      );
    }

    rootMerchantId = merchant.merchantId.toString();
  } else {
    rootMerchantId = merchant._id.toString();
  }

  // Get user's digital card
  const digitalCard = await DigitalCard.findOne({
    merchantId: rootMerchantId,
    userId,
  }).select("availablePoints lifeTimeEarnPoints");

  if (!digitalCard) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "User has no digital card with this merchant"
    );
  }

  const availablePoints = digitalCard.availablePoints ?? 0;
  const lifetimePoints = digitalCard.lifeTimeEarnPoints ?? 0;

  // Get all active tiers
  const tiers = await Tier.find({
    admin: rootMerchantId,
    isActive: true,
  })
    .sort({ pointsThreshold: 1 })
    .select("name pointsThreshold");

  let userTier: any = null;

  for (const tier of tiers) {
    if (lifetimePoints >= tier.pointsThreshold) {
      userTier = tier;
    } else {
      break;
    }
  }

  return {
    availablePoints: Number(availablePoints.toFixed(4)),
    lifetimePoints: Number(lifetimePoints.toFixed(4)),
    tierName: userTier?.name ?? "No tier Found",
    tier: userTier
      ? {
          _id: userTier._id,
          name: userTier.name,
          pointsThreshold: userTier.pointsThreshold,
        }
      : null,
  };
};

export const MemberService = {
  getAllMembers,
  getSingleMember,
  getSingleMemberTier,
};
