import { Schema, model } from "mongoose";

const counterSchema = new Schema({
  role: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});

export const UserCounter = model("UserCounter", counterSchema);
