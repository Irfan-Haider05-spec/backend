import { Types } from "mongoose";

export interface ITier {
  _id?: string;
  name: string;
  pointsThreshold: number;
  reward: Number;
  accumulationRule: number;
  redemptionRule: number;
  minTotalSpend: number;
  isActive?: boolean;
  admin: Types.ObjectId; // user/admin ID
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}
