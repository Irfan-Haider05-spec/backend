import { Types, Document, Model } from "mongoose";

export interface IRecentViewedItem {
  promotionId: Types.ObjectId;
}

export interface IRecentViewedPromotion extends Document {
  userId: Types.ObjectId;
  items: IRecentViewedItem[];
}

export type RecentViewedPromotionModel = Model<IRecentViewedPromotion>;
