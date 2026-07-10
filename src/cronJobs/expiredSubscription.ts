import { NotificationType } from "../app/modules/notification/notification.model";
import { Subscription } from "../app/modules/subscription/subscription.model";
import { User } from "../app/modules/user/user.model";
import { SUBSCRIPTION_STATUS } from "../enums/user";
import { sendNotification } from "../helpers/notificationsHelper";
import { logger } from "../shared/logger";

export const expireSubscriptionsJob = async () => {
  try {
    logger.info("========== [CRON] START ==========");

    const now = new Date();

    // 🔍 Step 1: Find expired active subscriptions
    const expiredSubscriptions = await Subscription.find({
      status: "active",
      currentPeriodEnd: { $lt: now },
    }).select("_id user currentPeriodEnd");

    logger.info(`📉 Found ${expiredSubscriptions.length} expired subscriptions`);

    if (!expiredSubscriptions.length) {
      logger.info("[CRON] No subscriptions to expire");
      logger.info("========== [CRON] END ==========");
      return;
    }

    // 🔹 Bulk update Subscriptions
    const subscriptionBulkOps = expiredSubscriptions.map((sub) => ({
      updateOne: {
        filter: { _id: sub._id },
        update: { $set: { status: "expired" as const } },
      },
    }));

    // 🔹 Bulk update Users
    const userBulkOps = expiredSubscriptions.map((sub) => ({
      updateOne: {
        filter: { _id: sub.user },
        update: {
          $set: {
            subscription: SUBSCRIPTION_STATUS.INACTIVE,
            paymentStatus: "expired",
          },
        },
      },
    }));

    // Execute bulk updates
    if (subscriptionBulkOps.length) {
      await Subscription.bulkWrite(subscriptionBulkOps);
    }

    if (userBulkOps.length) {
      await User.bulkWrite(userBulkOps);
    }

    // 🔹 Send notifications
    const userIds = expiredSubscriptions.map((sub) => sub.user);

    await sendNotification({
      userIds,
      title: "Subscription expired",
      body: "Your subscription has expired. Please renew to continue enjoying our services.",
      type: NotificationType.SYSTEM,
      channel: { socket: true, push: true },
    });

    logger.info("[CRON] Expired subscription notifications sent");
    logger.info("========== [CRON] END ==========");
  } catch (error) {
    logger.error("❌ [CRON] Subscription expire check failed", error);
  }
};  

