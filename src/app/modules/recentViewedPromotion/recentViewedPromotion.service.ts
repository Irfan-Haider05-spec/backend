import mongoose, { Types } from "mongoose";
import { RecentViewedPromotion } from "./recentViewedPromotion.model";
import { DigitalCard, DigitalCardPromotion } from "../customer/digitalCard/digitalCard.model";

const LIMIT = 10;

const addRecentViewedToDB = async (
  userId: mongoose.Types.ObjectId,
  promotionId: mongoose.Types.ObjectId
) => {
  const pId = new Types.ObjectId(promotionId);

  await RecentViewedPromotion.updateOne(
    { userId },
    { $pull: { items: pId } },
    { upsert: true }
  );

  const updated = await RecentViewedPromotion.findOneAndUpdate(
    { userId },
    {
      $push: {
        items: {
          $each: [pId],
          $position: 0,
        },
      },
    },
    { upsert: true, new: true }
  );

  if (updated.items.length > LIMIT) {
    updated.items = updated.items.slice(0, LIMIT);
    await updated.save();
  }

  return updated;
};

const getRecentViewedFromDB = async (userId: mongoose.Types.ObjectId) => {
  const record = await RecentViewedPromotion.findOne({ userId })
    .populate({
      path: "items",
      model: "PromotionMerchant",
      populate: {
        path: "merchantId",
        model: "User",
        select: "website",
      },
    })
    .lean();

  if (!record?.items?.length) return [];

  // 🔹 Get added promotions from digital card
  const digitalCard = await DigitalCard.findOne({ userId }).lean();

  const existingCardPromotions = digitalCard
    ? await DigitalCardPromotion.find({
        digitalCardId: digitalCard._id,
      })
        .select("promotionId")
        .lean()
    : [];

  const addedPromotionIds = new Set(
    existingCardPromotions.map((p) => p.promotionId?.toString())
  );

  // 🔹 Attach flag per promotion
  return record.items.map((promotion: any) => ({
    ...promotion,
    isPromotionAdded: addedPromotionIds.has(promotion._id.toString()),
  }));
};


export const RecentViewedPromotionService = {
  addRecentViewedToDB,
  getRecentViewedFromDB,
};
