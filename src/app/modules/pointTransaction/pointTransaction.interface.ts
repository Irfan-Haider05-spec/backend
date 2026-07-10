import { Types } from "mongoose";

export interface IPointTransaction {
    user: Types.ObjectId;
    type: "EARN" | "REDEEM";
    source: "REFERRAL" | "SUBSCRIPTION" | "ADMIN";
    referral: Types.ObjectId;
    points: number;
    note: string;
}