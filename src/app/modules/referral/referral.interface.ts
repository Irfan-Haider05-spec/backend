import { Types } from "mongoose";

export interface IReferral {
    referrer: Types.ObjectId;
    referredUser: Types.ObjectId;
    completed: boolean;
}