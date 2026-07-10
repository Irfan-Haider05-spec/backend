// src/modules/purchase/purchase.model.ts
import mongoose, { Schema } from "mongoose";
import { IPurchase } from "./purchase.interface";

const PurchaseSchema = new Schema<IPurchase>(
  {
    userId: { type: String, required: true },
    packageId: { type: String, required: true },
    platform: { type: String, enum: ["ios", "android"], required: true },
    receipt: { type: String, required: true },
    status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
    purchaseDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Purchase = mongoose.model<IPurchase>("Purchase", PurchaseSchema);
