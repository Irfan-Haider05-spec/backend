import { model, Schema } from "mongoose";

const digitalCardSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    merchantId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Unique auto-generated card code per merchant+user
    cardCode: {
      type: String,
      unique: true,
      required: true,
    },

    availablePoints: {
      type: Number,
      default: 0,
    },

    lifeTimeEarnPoints: {
      type: Number,
      default: 0,
    },

    hasReceivedFirstReward: {
      type: Boolean,
      default: false,
    },

    tier: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// ======================================================
// Promotion Collection Schema (Separate Collection)
// ======================================================

const digitalCardPromotionSchema = new Schema(
  {
    digitalCardId: {
      type: Schema.Types.ObjectId,
      ref: "DigitalCard",
      required: true,
    },

    promotionId: {
      type: Schema.Types.ObjectId,
      ref: "PromotionMerchant",
      required: true,
    },

    status: {
      type: String,
      enum: ["unused", "used", "expired", "pending"],
      default: "pending",
    },

    usedAt: {
      type: Date,
    },

    promoCode: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

// ======================================================
// INDEXES
// ======================================================

// 1. Prevent duplicate card per merchant-user
digitalCardSchema.index(
  { merchantId: 1, userId: 1 },
  { unique: true }
);

// 2. Fast checkout lookup (HOT PATH)
digitalCardSchema.index({
  merchantId: 1,
  cardCode: 1,
});

// 3. Fast user history queries
digitalCardSchema.index({
  userId: 1,
  createdAt: -1,
});

// ======================================================
// Promotion Indexes
// ======================================================

// Fast lookup by digital card
digitalCardPromotionSchema.index({
  digitalCardId: 1,
});

// Fast promotion lookup
digitalCardPromotionSchema.index({
  promotionId: 1,
});

// Fast status filtering
digitalCardPromotionSchema.index({
  status: 1,
});


// Prevent duplicate promotion assign to same card
digitalCardPromotionSchema.index(
  {
    digitalCardId: 1,
    promotionId: 1,
  },
  { unique: true }
);

// ======================================================
// MODELS
// ======================================================

export const DigitalCard = model("DigitalCard", digitalCardSchema);

export const DigitalCardPromotion = model(
  "DigitalCardPromotion",
  digitalCardPromotionSchema
);