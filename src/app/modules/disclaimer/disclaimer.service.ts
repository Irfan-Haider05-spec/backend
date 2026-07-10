import { JwtPayload } from "jsonwebtoken";
import { IDisclaimer } from "./disclaimer.interface";
import { Disclaimer } from "./disclaimer.model";
import { notifyAllActiveUsers } from "../../../helpers/notificationAllActiveUsers";
import { NotificationType } from "../notification/notification.model";
import { DISCLAIMER_NOTIFICATION_MAP } from "./disclaimer.notification.config";

// create or update disclaimer
const createUpdateDisclaimer = async (
  payload: IDisclaimer,
  _user: JwtPayload
) => {
  const result = await Disclaimer.findOneAndUpdate(
    { type: payload.type },
    { $set: payload },
    { new: true, upsert: true }
  );
  const notificationConfig = DISCLAIMER_NOTIFICATION_MAP[payload.type];

  if (notificationConfig) {
    await notifyAllActiveUsers({
      title: notificationConfig.title,
      body: notificationConfig.body,
      type: NotificationType.POLICY,
      audience: notificationConfig.audience,
    });
  }

  return result;
};

// get all disclaimer
const getAllDisclaimer = async (type: string) => {
  const result = await Disclaimer.findOne({ type });
  return result;
};

export const DisclaimerServices = { createUpdateDisclaimer, getAllDisclaimer };
