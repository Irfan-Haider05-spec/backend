import { Model, Types } from "mongoose";

export type IPackage = {
    title: string;
    description: string;
    price: number;
    duration: '1 month' | '4 months' | '8 months' | '1 year';
    paymentType: 'Monthly' | 'Yearly';
    isFreeTrial?: boolean;
    features: string[];
    productId: string;
    priceId: string;
    loginLimit: number;
    paymentLink?: string;
    status?: 'Active' | 'Delete';
    payoutAccountId?: string;
    admin: Types.ObjectId;
    priceIdWithPoints?: Record<string, string>;
 // NEW
    
};

export type PackageModel = Model<IPackage, Record<string, unknown>>;
