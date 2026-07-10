import { Schema, model } from "mongoose";
import { IRating } from "./rating.interface";

const ratingSchema = new Schema<IRating>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    merchantId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    promotionId: {
      type: Schema.Types.ObjectId,
      ref: "Promotion",
      required: true,
    },
    digitalCardId: {
      type: Schema.Types.ObjectId,
      ref: "DigitalCard",
      required: true,
    },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, default: "" },
  },
  { timestamps: true }
);


/**
 * 🚀 CORE PERFORMANCE INDEXES
 */

// 1. Merchant average rating query (MOST IMPORTANT)
ratingSchema.index({
  merchantId: 1,
});

// 2. User rating history per merchant
ratingSchema.index({
  userId: 1,
  merchantId: 1,
});

// 3. Promotion-based rating lookup (analytics / reporting)
ratingSchema.index({
  promotionId: 1,
  merchantId: 1,
});

// 4. Enforce ONE rating per user per promotion per merchant
ratingSchema.index(
  {
    userId: 1,
    merchantId: 1,
    promotionId: 1,
  },
  { unique: true }
);


export const Rating = model<IRating>("Rating", ratingSchema);
