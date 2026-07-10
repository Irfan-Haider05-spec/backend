import mongoose, { Schema, model } from "mongoose";
import { IPromotion } from "./adminPromotion.interface";

const promotionSchema = new Schema(
  {
    // Auto-generated custom card id (8 characters)
    cardId: {
      type: String,
      unique: true,
    },

    // Promotion Name
    name: { type: String, required: true },

    // Customer Segment
    customerSegment: {
      type: String,
      required: true,
      enum: [
        "new_customer",
        "returning_customer",
        "loyal_customer",
        "vip_customer",
        "all_customer",
      ],
    },

    // Discount Percentage
    discountPercentage: { type: Number, required: true },

    // Promotion Type
    promotionType: {
      type: String,
      required: true,
      enum: ["seasonal", "referral", "flash_sale", "loyalty"],
    },

    // Date Range
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    // Promotion Days
    availableDays: {
      type: [
        {
          type: String,
          enum: ["all", "sun", "mon", "tue", "wed", "thu", "fri", "sat"],
        },
      ],
      default: ["all"],
    },

    // Image Upload
    image: { type: String },

    // Status
    status: {
      type: String,
      enum: ["active", "inactive", "expired"],
      default: "active",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);


// 1. Merchant dashboard queries (MOST IMPORTANT)
promotionSchema.index({
  merchantId: 1,
  status: 1,
});

// 2. Active promotion lookup with date validation
promotionSchema.index({
  merchantId: 1,
  status: 1,
  startDate: 1,
  endDate: 1,
});

// 3. Scheduling / time-based queries
promotionSchema.index({
  startDate: 1,
  endDate: 1,
});

// 4. Fast checkout filtering (active only promotions)
promotionSchema.index({
  status: 1,
  endDate: 1,
});


export const PromotionAdmin = model<IPromotion>(
  "AdminPromotionMerchant",
  promotionSchema
);
