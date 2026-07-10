import { model, Schema } from "mongoose";
import { ISalesRep, SalesRepModel } from "./salesRep.interface";

const salesRepSchema = new Schema<ISalesRep, SalesRepModel>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    packageId: {
      type: Schema.Types.ObjectId,
      ref: "Package",
      required: true,
    },
    salesRepName: {
      type: String,
    },
    salesRepReferralId: {
      type: String,
    },
    acknowledged: {
      type: Boolean,
      default: false,
    },
    acknowledgeDate: {
      type: Date,
    },
    token: {
      type: String,
    },
    tokenGenerateDate: {
      type: Date,
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "unpaid", "expired"],
      default: "unpaid",
    },
    subscriptionStatus: {
      type: String,
      enum: ["active", "inActive"],
      default: "inActive",
    },
    subscriptionStatusChangedDate: {
      type: Date,
    },
    price: {
      type: Number,
    },
  },
  { timestamps: true }
);



salesRepSchema.index({
  customerId: 1,
  createdAt: -1,
});


salesRepSchema.index({
  customerId: 1,
  subscriptionStatus: 1,
});


salesRepSchema.index({
  packageId: 1,
  createdAt: -1,
});

export const SalesRep = model<ISalesRep, SalesRepModel>(
  "SalesRep",
  salesRepSchema
);
