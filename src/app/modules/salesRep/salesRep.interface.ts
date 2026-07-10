import { Model, Types } from "mongoose";

export type ISalesRep = {
  customerId: Types.ObjectId;
  packageId: Types.ObjectId;
  acknowledged: boolean;
  acknowledgeDate?: Date;
  token?: string;
  salesRepName?: string;
  salesRepReferralId?: string;
  subscriptionStatus: "active" | "inActive";
  subscriptionStatusChangedDate?: Date;
  tokenGenerateDate?: Date;
  paymentStatus: "paid" | "unpaid" | "expired";
  createdAt: Date;
  updatedAt: Date;
  price: number;
};

export type SalesRepModel = Model<ISalesRep, Record<string, unknown>>;
