import { Schema, model, Types } from "mongoose";

const merchantCustomerSchema = new Schema(
    {
        merchantId: {
            type: Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        customerId: {
            type: Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        totalSpend: { type: Number, default: 0 },
        totalOrders: { type: Number, default: 0 },

        isVip: { type: Boolean, default: false },
        lastPurchaseAt: { type: Date },

        points: { type: Number, default: 0 },
        segment: {
        type: String,
        enum: [
            "new_customer",
            "returning_customer",
            "loyal_customer",
            "vip_customer",
            "all_customer",
        ],
        default: "all_customer",
        }
    },
    { timestamps: true }
);

merchantCustomerSchema.index(
    { merchantId: 1, customerId: 1 },
    { unique: true }
);

export const MerchantCustomer = model(
    "MerchantCustomer",
    merchantCustomerSchema
);
