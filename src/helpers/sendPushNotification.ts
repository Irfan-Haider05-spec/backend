import admin from "firebase-admin"; // firebase-admin init করা আছে ধরে নিই
import { logger } from "../shared/logger";

export const sendPushNotification = async (fcmToken: string, title: string, body: string, data?: Record<string, string>) => {
  if (!fcmToken) return;

  

  const message = {
    token: fcmToken,
    notification: { title, body },
    data: data || {},
  };

  try {
    await admin.messaging().send(message);

  } catch (err) {
    logger.error("Something failed", err);
  }
};
