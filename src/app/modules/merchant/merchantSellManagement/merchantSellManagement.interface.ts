// merchantSellManagement.interface.ts
import { Types } from "mongoose";

export interface IUser {
  _id: Types.ObjectId;
  firstName: string;
  lastName?: string;
  email?: string;
}

export interface IDigitalCard {
  _id: Types.ObjectId;
  cardNumber: string;
  type?: string;
}

export interface IPromotion {
  _id: Types.ObjectId;
  name: string;
  discountPercentage: number;
}

export interface ISell {
  _id: Types.ObjectId;
  merchantId: Types.ObjectId;
  userId: IUser | Types.ObjectId;
  digitalCardId: IDigitalCard | Types.ObjectId;
  digitalCardCode?: string;
  promotionId?: IPromotion | Types.ObjectId;
  promotionIds?: (IPromotion | Types.ObjectId)[];
  totalBill: number;
  totalGrossValue?: number;
  totalDiscount?: number;
  discountedBill?: number;
  pointRedeemed?: number;
  pointDiscount?: number;
  finalBill?: number;
  netBillForPoint?: number;
  accumulationPercentage?: number;
  eligibleAmount?: number;
  pointsEarned: number;
  status: "completed" | "pending" | "rejected" | "expired";
  createdAt: Date;
  updatedAt: Date;
  approvalExpiresAt?: Date;
}


// Existing interfaces kept intact
export interface IFindCustomerResult {
  customer: any | null;
  giftCards: any[];
}

export interface ICompleteTransactionPayload {
  merchantId?: string | Types.ObjectId;
  customerId: string | Types.ObjectId;
  totalBill: number;
  redeemPoints?: number;
  giftCardCode?: string;
}

export interface RequestApprovalOptions {
  merchantId: string;
  digitalCardCode: string;
  promotionId?: string | null; // optional now
  totalBill?: number;
  pointRedeemed?: number;
}
