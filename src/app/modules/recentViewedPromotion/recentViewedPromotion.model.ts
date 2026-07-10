import mongoose from "mongoose";
import { IRecentViewedPromotion } from "./recentViewedPromotion.interface";

const recentViewedPromotionSchema = new mongoose.Schema<IRecentViewedPromotion>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PromotionMerchant",
      },
    ],
  },
  { timestamps: true }
);



/**
 * 🚀 CORE INDEX
 */
recentViewedPromotionSchema.index({ userId: 1 }, { unique: true });

/**
 * ⚡ PRE-SAVE HOOK: enforce max 20 items
 */
recentViewedPromotionSchema.pre("save", function (next) {
  if (this.items && this.items.length > 20) {
    // keep only latest 20
    this.items = this.items.slice(-20);
  }
  next();
});

/**
 * ⚡ OPTIONAL: safer update pattern for $push
 * (recommended for high traffic systems)
 */
recentViewedPromotionSchema.index({ updatedAt: -1 });

export const RecentViewedPromotion = mongoose.model<IRecentViewedPromotion>(
  "RecentViewedPromotion",
  recentViewedPromotionSchema
);
