import crypto from "crypto";
import { User } from "../app/modules/user/user.model";

export const generateReferralId = () => {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
};

export const createUniqueReferralId = async () => {
  let attempts = 0;

  while (attempts < 10) {
    attempts++;

    const referralId = generateReferralId();

    const exists = await User.exists({ referralId });

    if (!exists) {
      return referralId;
    }
  }

  throw new Error("Could not generate unique referral ID");
};