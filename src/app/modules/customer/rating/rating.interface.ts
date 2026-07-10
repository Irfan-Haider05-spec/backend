import { Types } from "mongoose";

export interface IRating {
  userId: Types.ObjectId;
  merchantId: Types.ObjectId;
  promotionId: Types.ObjectId;
  digitalCardId: Types.ObjectId;

  rating: number;
  comment?: string;
}
