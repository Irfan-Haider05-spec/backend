import { model, Schema } from "mongoose";

const pointTransactionSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ["EARN", "REDEEM"],
            required: true,
        },
        source: {
            type: String,
            enum: ["REFERRAL", "SUBSCRIPTION", "ADMIN"],
            required: true,
        },
        referral: {
            type: Schema.Types.ObjectId,
            ref: "Referral",
            default: null,
        },
        points: {
            type: Number,
            required: true,
        },
        note: String,
    },
    { timestamps: true }
);


pointTransactionSchema.index({
  user: 1,
  createdAt: -1,
});

pointTransactionSchema.index({
  user: 1,
  type: 1,
});

pointTransactionSchema.index({
  user: 1,
  source: 1,
});

pointTransactionSchema.index({
  referral: 1,
});

const PointTransaction = model("PointTransaction", pointTransactionSchema);
export default PointTransaction;
