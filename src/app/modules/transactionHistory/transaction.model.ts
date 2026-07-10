// src/app/modules/points/point.model.ts
import { Schema, model } from "mongoose";
import { IPointTransaction } from "./transaction.interface";

export enum POINT_TRANSACTION_TYPE {
  EARN = "EARN",
  USE = "USE",
}

const pointTransactionSchema = new Schema<IPointTransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: Object.values(POINT_TRANSACTION_TYPE), required: true },
    points: { type: Number, required: true },
    source: { type: String, required: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: "Subscription" },
    balanceAfter: { type: Number, required: true },
  },
  { timestamps: true }
);

pointTransactionSchema.index({ userId: 1, createdAt: -1 });

export const TransactionHistory = model<IPointTransaction>(
  "TransactionHistory",
  pointTransactionSchema
);
