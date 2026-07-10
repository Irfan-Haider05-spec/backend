// src/modules/package/package.interface.ts


// src/modules/package/package.model.ts
import mongoose, { Schema } from "mongoose";
import { IPackage } from "./corePackage.interface";

const PackageSchema = new Schema<IPackage>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    duration: {
      type: String,
      enum: ["1 month", "1 year", "4 months", "8 months"],
      required: true,
    },
    priceId: { type: String },
    productId: { type: String },
  },
  { timestamps: true }
);

export const Package = mongoose.model<IPackage>("Package", PackageSchema);
