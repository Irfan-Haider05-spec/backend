import { Request } from "express";
import { IUser } from "../app/modules/user/user.interface";
// path ঠিক করো

export interface AuthRequest extends Request {
  user?: IUser; // এখন TypeScript জানবে user থাকতে পারে বা না থাকতে পারে
}
