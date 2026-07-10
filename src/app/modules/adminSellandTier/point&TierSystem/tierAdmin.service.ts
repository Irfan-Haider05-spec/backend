import { Tier } from "./tierAdmin.model";
import { ITier } from "./tierAdmin.interface";

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

/* ================= GET ALL ================= */

const getAllTiersFromDB = async (
  query: Record<string, any>,
  adminId?: string
) => {
  return getAllTiers(Tier, query, adminId);
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

export const TierService = {
  createTierToDB,
  updateTierToDB,
  getTierFromDB,
  getAllTiersFromDB,
  getSingleTierFromDB,
  deleteTierToDB,
};