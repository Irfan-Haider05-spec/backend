import { UserCounter } from "./user.counter.model";
import { USER_ROLES } from "../../../enums/user";

export const generateCustomUserId = async (role: string) => {
  let prefix = "C";
  let counterRole = "CUSTOMER";

  if (role === USER_ROLES.MERCHANT) {
    prefix = "M";
    counterRole = "MERCHANT";
  } else if (role === USER_ROLES.ADMIN) {
    prefix = "A";
    counterRole = "ADMIN";
  } else if (role === USER_ROLES.SUPER_ADMIN) {
    prefix = "SA";
    counterRole = "SUPER_ADMIN";
  }

  const counter = await UserCounter.findOneAndUpdate(
    { role: counterRole },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const number = counter.seq.toString().padStart(5, "0");
  return `${prefix}_${number}`;
};
