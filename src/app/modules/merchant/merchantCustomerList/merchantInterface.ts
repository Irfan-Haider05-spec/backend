import { Types } from "mongoose";

export interface IDigitalCard {
  _id: Types.ObjectId;
  uniqueId: string;
  totalPoints: number;
  expiry?: Date | null;
}

export interface IMember {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  digitalCards?: IDigitalCard[];
}
