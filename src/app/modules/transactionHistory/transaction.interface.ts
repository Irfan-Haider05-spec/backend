// src/app/modules/points/point.interface.ts
import { Document, Types } from "mongoose";

export interface IPointTransaction extends Document {
  userId: Types.ObjectId;
  type: "EARN" | "USE";
  points: number;
  source: "SUBSCRIPTION_BONUS" | "SUBSCRIPTION_REDEEM" | string;
  subscriptionId?: Types.ObjectId;
  balanceAfter: number;
  createdAt: Date;
  updatedAt: Date;
}
