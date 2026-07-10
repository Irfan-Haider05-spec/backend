
import { Types } from "mongoose";
import { DigitalCard } from "../digitalCard/digitalCard.model";
import { Rating } from "./rating.model";


const createRating = async (
  userId: string,
  digitalCardId: string,
  promotionId: string,
  merchantId: string,
  rating: number,
  comment?: string
) => {


  const card = await DigitalCard.findOne({
    _id: new Types.ObjectId(digitalCardId),
    userId: new Types.ObjectId(userId)
  });

  if (!card) {
    throw new Error("Digital card not found for user");
  }



  // rating create
  const create = await Rating.create({
    userId: new Types.ObjectId(userId),
    merchantId: new Types.ObjectId(merchantId),
    promotionId: new Types.ObjectId(promotionId),
    digitalCardId: new Types.ObjectId(digitalCardId),
    rating,
    comment,
  });

  return create;
};

const getMerchantRatings = async (merchantId: string) => {
  return await Rating.find({
    merchantId: new Types.ObjectId(merchantId),
  }).sort({ createdAt: -1 });
};


const getMerchantAverageRating = async (merchantId: string) => {
  if (!Types.ObjectId.isValid(merchantId)) {
    throw new Error("Invalid merchant ID");
  }

  const result = await Rating.aggregate([
    { $match: { merchantId: new Types.ObjectId(merchantId) } },
    {
      $group: {
        _id: "$merchantId",
        averageRating: { $avg: "$rating" },
        totalRatings: { $sum: 1 },
      },
    },
  ]);

  return result[0] || { averageRating: 0, totalRatings: 0 };
};

const findRatingByPromotionDigitalCard = async (
  promotionId: string,
  digitalCardId: string
) => {
  return Rating.findOne({
    promotionId: new Types.ObjectId(promotionId),
    digitalCardId: new Types.ObjectId(digitalCardId),
  })
    .select("rating")
    .lean();
};

const findRatingsByMerchantAndUsers = async (
  merchantId: string,
  userIds: string[]
) => {
  const validUserIds = userIds
    .filter((id) => Types.ObjectId.isValid(id))
    .map((id) => new Types.ObjectId(id));

  if (!validUserIds.length) return [];

  return Rating.find({
    merchantId: new Types.ObjectId(merchantId),
    userId: { $in: validUserIds },
  })
    .select("userId rating comment")
    .lean();
};

export const RatingService = {
  createRating,
  getMerchantRatings,
  getMerchantAverageRating,
  findRatingByPromotionDigitalCard,
  findRatingsByMerchantAndUsers,
};
