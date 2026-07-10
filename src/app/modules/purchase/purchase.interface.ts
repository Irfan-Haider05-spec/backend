// src/modules/purchase/purchase.interface.ts
import { Document } from "mongoose";

export interface IPurchase extends Document {
  userId: string;
  packageId: string;
  platform: "ios" | "android";
  receipt: string;
  status: "pending" | "success" | "failed";
  purchaseDate: Date;
}
