import { Schema, model } from "mongoose";
import { ITier } from "./tierAdmin.interface";

const tierSchema = new Schema<ITier>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    pointsThreshold: {
      type: Number,
      required: true,
      min: 0,
    },

    reward: {
      type: Number,
      default: 0,
    },

    accumulationRule: {
      type: Number,
      required: true,
    },

    redemptionRule: {
      type: Number,
      required: true,
    },

    minTotalSpend: {
      type: Number,
      required: true,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);




tierSchema.index({ admin: 1, isActive: 1, pointsThreshold: 1 });
tierSchema.index({ admin: 1, pointsThreshold: 1 });



export const Tier = model<ITier>("AdminTier", tierSchema);