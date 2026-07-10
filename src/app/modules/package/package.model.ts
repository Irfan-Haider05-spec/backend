import { model, Schema } from "mongoose";
import { IPackage, PackageModel } from "./package.interface";

const packageSchema = new Schema<IPackage, PackageModel>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    duration: { type: String, enum: ['1 month', '4 months', '8 months', '1 year'], required: true },
    paymentType: { type: String, enum: ['Monthly', 'Yearly'], required: false },
    features: [{ type: String, required: true }],
    productId: { type: String, required: true },
    priceId: { type: String, required: true },
    loginLimit: { type: Number, required: true },
    status: { type: String, enum: ['Active', 'Delete'], default: 'Active' },
    payoutAccountId: { type: String },
    admin: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isFreeTrial: { type: Boolean, default: false },
    priceIdWithPoints: {
    type: Map,
    of: String,
    default: new Map(),
    } // <-- UPDATED
}, { timestamps: true });


export const Package = model<IPackage, PackageModel>("Package", packageSchema);
