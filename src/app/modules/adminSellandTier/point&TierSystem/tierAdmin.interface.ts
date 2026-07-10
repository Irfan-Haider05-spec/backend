import { Types } from "mongoose";

export interface ITier {
  _id?: Types.ObjectId;
  name: string;
  pointsThreshold: number;
  reward: number;
  accumulationRule: number;
  redemptionRule: number;
  minTotalSpend: number;
  isActive?: boolean;
  admin: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}