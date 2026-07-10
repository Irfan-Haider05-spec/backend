import { Schema, model, Types } from "mongoose";

export interface IApplyRequest {
  userId: Types.ObjectId;
  merchantId: Types.ObjectId;
  giftCardId: Types.ObjectId;
 pointsEarned: number;
  billAmount: number;
  pointsToRedeem: number;
  remainingBill: number;
  status: "pending" | "approved" | "denied" | "merchant_confirmed";

  expiresAt: Date; 
}

const ApplyRequestSchema = new Schema<IApplyRequest>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    merchantId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    giftCardId: { type: Schema.Types.ObjectId, ref: "GiftCard", required: true },

    billAmount: { type: Number, required: true },
    pointsToRedeem: { type: Number, required: true },
    pointsEarned: { type: Number, default: 0 },
    remainingBill: { type: Number, required: true },

    status: {
      type: String,
      enum: ["pending", "approved", "denied", "merchant_confirmed"],
      default: "pending",
    },

    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export const ApplyRequest = model<IApplyRequest>("ApplyRequest", ApplyRequestSchema);
