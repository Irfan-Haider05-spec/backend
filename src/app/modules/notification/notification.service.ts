import { JwtPayload } from "jsonwebtoken";
import { Notification, NotificationType } from "./notification.model";

import { timeAgo } from "../../../utils/timeAgo";
import QueryBuilder from "../../../utils/queryBuilder";
import { sendNotification } from "../../../helpers/notificationsHelper";

const getUserNotificationFromDB = async (
  userId: string,
  query: Record<string, any>
) => {
  const paginationQuery = {
    ...query,
    limit: query.limit ? Number(query.limit) : 50,
  };

  const notificationQuery = new QueryBuilder(
    Notification.find({ userId }).sort("-createdAt"),
    paginationQuery
  ).paginate();

  const [notifications, pagination, unreadCount] = await Promise.all([
    notificationQuery.modelQuery.lean().exec(),
    notificationQuery.getPaginationInfo(),
    Notification.countDocuments({ userId, isRead: false }),
  ]);

  return {
    data: {
      notifications: notifications.map((notification: any) => {
        return {
          ...notification,
          timeAgo: timeAgo(notification.createdAt),
        };
      }),

      unreadCount,
    },
    pagination,
  };
};

const readUserNotificationToDB = async (user: JwtPayload): Promise<boolean> => {
  await Notification.bulkWrite([
    {
      updateMany: {
        filter: { userId: user._id, isRead: false },
        update: { $set: { isRead: true } },
        upsert: false,
      },
    },
  ]);

  return true;
};
const sendTestNotification = async (user: JwtPayload) => {
  await sendNotification({
    userIds: [user._id],
    title: "Test Notification",
    body: "This is a test notification.",
    type: NotificationType.SYSTEM,
  });
};

const sendSalesRepActiveTestNotification = async (user: JwtPayload) => {
  io.emit(`salesActivation::${user._id.toString()}`, {
    status: "active"
  });
};


const getUnreadNotificationCountFromDB = async (
  userId: string
): Promise<number> => {
  return Notification.countDocuments({
    userId,
    isRead: false,
  });
};

export const NotificationService = {
  getUserNotificationFromDB,
  readUserNotificationToDB,
  sendTestNotification,
  sendSalesRepActiveTestNotification,
  getUnreadNotificationCountFromDB
};
