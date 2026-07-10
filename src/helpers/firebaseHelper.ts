import admin from "firebase-admin";
import { logger } from "../shared/logger";

// Initialize Firebase SDK (only once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

// Multiple users
const sendPushNotifications = async (
  values: admin.messaging.MulticastMessage
): Promise<{ successCount: number; failureCount: number }> => {
  const res = await admin.messaging().sendEachForMulticast(values);

  logger.info("Notifications sent successfully", {
    successCount: res.successCount,
    failureCount: res.failureCount,
  });

  return {
    successCount: res.successCount,
    failureCount: res.failureCount,
  };
};

// Single user
const sendPushNotification = async (
  values: admin.messaging.Message
): Promise<string> => {
  const res = await admin.messaging().send(values);

  logger.info("Notification sent successfully", res);

  return res;
};

export const firebaseHelper = {
  sendPushNotifications,
  sendPushNotification,
};