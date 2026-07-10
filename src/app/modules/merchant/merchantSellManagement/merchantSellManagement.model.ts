import { Schema, model, Types } from "mongoose";
import { MerchantCustomer } from "../merchantCustomer/merchantCustomer.model";

const sellSchema = new Schema(
  {
    merchantId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    digitalCardId: {
      type: Types.ObjectId,
      ref: "DigitalCard",
      required: true,
    },

    promotionIds: [{ type: Types.ObjectId, ref: "PromotionMerchant" }],

    totalBill: { type: Number, required: true },
    discountedBill: { type: Number, required: true },
    pointsEarned: { type: Number, required: true },
    pointRedeemed: { type: Number },

    status: {
      type: String,
      enum: ["completed", "pending", "rejected", "expired"],
      default: "pending",
    },

     approvalExpiresAt: {
      type: Date,
      default: null,
    },
     
    
  },
  { timestamps: true }
);

// ===== indexes =====
sellSchema.index({ merchantId: 1, status: 1, createdAt: -1 });
sellSchema.index({ userId: 1, merchantId: 1, createdAt: -1 });
sellSchema.index(
  { approvalExpiresAt: 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: {
      status: "pending",
      approvalExpiresAt: { $type: "date" },
    },
  }
);

// ===== pre validate =====
sellSchema.pre("validate", function (next) {
  if (this.status === "pending") {
    if (!this.approvalExpiresAt) {
      this.approvalExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    }
  }

  if (this.status === "completed") {
    this.approvalExpiresAt = null;
  }

  next();
});

// ===============================
// 🔥 POST SAVE HOOK (OPTIMIZED)
// ===============================
sellSchema.post("save", async function (doc) {
  if (doc.status !== "completed") return;

  try {
    // 1️⃣ Update customer stats (single atomic update)
    const updatedCustomer = await MerchantCustomer.findOneAndUpdate(
      {
        merchantId: doc.merchantId,
        customerId: doc.userId,
      },
      {
        $inc: {
          totalSpend: doc.totalBill,
          totalOrders: 1,
          points: doc.pointsEarned || 0,
        },
        $set: {
          lastPurchaseAt: new Date(),
        },
      },
      {
        upsert: true,
        new: true,
      }
    );

    if (!updatedCustomer) return;

    // 2️⃣ Date ranges
    const sixMonthsAgo = new Date(
      Date.now() - 6 * 30 * 24 * 60 * 60 * 1000
    );
    const twelveMonthsAgo = new Date(
      Date.now() - 12 * 30 * 24 * 60 * 60 * 1000
    );

    // 3️⃣ SINGLE aggregation (fix N+2 problem)
    const [agg] = await model("Sell").aggregate([
      {
        $match: {
          merchantId: doc.merchantId,
          userId: doc.userId,
          status: "completed",
          createdAt: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: null,
          totalSpend12M: { $sum: "$totalBill" },
          totalOrders12M: { $sum: 1 },
          last6MonthsOrders: {
            $sum: {
              $cond: [
                { $gte: ["$createdAt", sixMonthsAgo] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const totalSpend12M = agg?.totalSpend12M || 0;
    const last6MonthsPurchases = agg?.last6MonthsOrders || 0;

    const totalOrders = updatedCustomer.totalOrders;

    const avgSpend = 10000;

    // 4️⃣ Segment logic
    let segment:
      | "new_customer"
      | "returning_customer"
      | "loyal_customer"
      | "vip_customer"
      | "all_customer" = "new_customer";

    if (
      last6MonthsPurchases >= 20 ||
      totalSpend12M >= 3 * avgSpend
    ) {
      segment = "vip_customer";
    } else if (
      last6MonthsPurchases >= 5 ||
      totalOrders >= 3 ||
      updatedCustomer.totalSpend >= 1.5 * avgSpend
    ) {
      segment = "loyal_customer";
    } else if (totalOrders >= 2 && last6MonthsPurchases < 5) {
      segment = "returning_customer";
    }

    // 5️⃣ Save segment
    updatedCustomer.segment = segment;
    await updatedCustomer.save();
  } catch (err) {
    console.error("Sell post-save hook error:", err);
  }
});

export const Sell = model("Sell", sellSchema);