import { Schema, model } from "mongoose";
import { IFavorite } from "./favorite.interface";

const favoriteSchema = new Schema<IFavorite>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    merchantId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Prevent duplicate favorites
favoriteSchema.index({ userId: 1, merchantId: 1 }, { unique: true });

export const Favorite = model<IFavorite>("Favorite", favoriteSchema);
