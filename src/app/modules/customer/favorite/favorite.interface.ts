import { Types } from "mongoose";

export interface IFavorite {
  userId: Types.ObjectId;
  merchantId: Types.ObjectId;
}
