import { Schema, model, Types } from "mongoose";

const pushSchema = new Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    state: { type: String,  },
    country: { type: String },
    city: { type: String }, 
    tier: { type: String },
    subscriptionType: { type: String },
    status: { type: String },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    sentCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    mediaUrl: { type: String },
  },
  { timestamps: true }
);

export const Push = model("Push", pushSchema);
