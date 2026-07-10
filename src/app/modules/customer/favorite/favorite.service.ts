import { Favorite } from "./favorite.model";
import { Types } from "mongoose";

const toggleFavorite = async (userId: string, merchantId: string) => {
  const existing = await Favorite.findOne({
    userId: new Types.ObjectId(userId),
    merchantId: new Types.ObjectId(merchantId),
  });

  if (existing) {
    // ✅ Remove favorite (unfavorite)
    await existing.deleteOne();
    return { isFavorite: false, merchantId };
  } else {
    // ✅ Add favorite
    await Favorite.create({
      userId: new Types.ObjectId(userId),
      merchantId: new Types.ObjectId(merchantId),
    });
    return { isFavorite: true, merchantId };
  }
};


const getUserFavorites = async (userId: string) => {
  return await Favorite.find({
    userId: new Types.ObjectId(userId),
  })
    .populate({
      path: "merchantId", 
      model: "User",      
      select: "firstName email role businessName" 
    })
    .sort({ createdAt: -1 });
};


const removeFavorite = async (userId: string, merchantId: string) => {
  const result = await Favorite.findOneAndDelete({
    userId: new Types.ObjectId(userId),
    merchantId: new Types.ObjectId(merchantId),
  });

  if (!result) {
    throw new Error("Favorite merchant not found");
  }

  return { message: "Unfavorited successfully" };
};

export const FavoriteService = {
  toggleFavorite,
  getUserFavorites,
  removeFavorite,
};
