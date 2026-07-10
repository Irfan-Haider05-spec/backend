import { Tier } from "./tier.model";
import { ITier } from "./tier.interface";

import { User } from "../../user/user.model";
import { Sell } from "../merchantSellManagement/merchantSellManagement.model";

import {
  createTier,
  updateTier,
  getTier,
  getSingleTier,
  deleteTier,
  getAllTiers,
} from "../../../../shared/tier/tier.util";

/* ================= CREATE ================= */

const createTierToDB = async (
  payload: Partial<ITier>
): Promise<ITier> => {
  return createTier(Tier, payload);
};

/* ================= UPDATE ================= */

const updateTierToDB = async (
  id: string,
  payload: Partial<ITier>
): Promise<ITier | null> => {
  return updateTier(Tier, id, payload);
};

/* ================= GET TIERS ================= */

const getTierFromDB = async (
  adminId?: string
): Promise<ITier[]> => {
  return getTier(Tier, adminId);
};

/* ================= SINGLE ================= */

const getSingleTierFromDB = async (
  id: string
): Promise<ITier | null> => {
  return getSingleTier(Tier, id);
};

/* ================= DELETE ================= */

const deleteTierToDB = async (
  id: string
): Promise<ITier | null> => {
  return deleteTier(Tier, id);
};

/* ================= CHECK EXISTING ================= */

const checkExistingTier = async (
  admin: string,
  name: string
) => {
  return Tier.findOne({ admin, name });
};

/* ================= NOTIFICATION ================= */

const getMerchantAndCustomersForNotification = async (
  filterId: string
) => {
  const fullUser = await User.findById(filterId).select(
    "_id firstName businessName"
  );

  const customerIds = await Sell.find({
    merchantId: filterId,
    status: "completed",
  }).distinct("userId");

  let customerSocketIds: string[] = [];

  if (customerIds?.length) {
    const customers = await User.find({
      _id: { $in: customerIds },
    }).select("_id firstName socketIds");

    customerSocketIds = customers.map((c) =>
      c._id.toString()
    );
  }

  return {
    fullUser,
    customerSocketIds,
  };
};

/* ================= GET ALL ================= */

const getTiersFromDB = async (
  query: Record<string, any>,
  adminId: string
) => {
  return getAllTiers(Tier, query, adminId);
};

const getActiveTiersSortedByThreshold = async () => {
  return Tier.find({ isActive: true }).sort({ pointsThreshold: 1 }).lean();
};

const hasActiveTierForMerchant = async (merchantId: string) => {
  return Tier.exists({ admin: merchantId, isActive: true });
};

const getBestTierForPoints = async (
  adminId: string,
  points: number
) => {
  return Tier.findOne({
    admin: adminId,
    isActive: true,
    pointsThreshold: { $lte: points },
  }).sort({ pointsThreshold: -1 });
};

export const TierService = {
  createTierToDB,
  updateTierToDB,
  getTierFromDB,
  getSingleTierFromDB,
  deleteTierToDB,
  checkExistingTier,
  getMerchantAndCustomersForNotification,
  getTiersFromDB,
  getActiveTiersSortedByThreshold,
  hasActiveTierForMerchant,
  getBestTierForPoints,
};