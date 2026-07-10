import express from "express";
import auth from "../../middlewares/auth";

import { NotificationController } from "./notification.controller";

const router = express.Router();

router.get("/", auth(), NotificationController.getMyNotification);
router.patch("/read", auth(), NotificationController.readMyNotifications);
router.post("/test", auth(), NotificationController.sendTestNotification);
router.post("/sales-rep-active-test", auth(), NotificationController.sendSalesRepActiveTestNotification);
router.get(
  "/unread-count",
  auth(),
  NotificationController.getUnreadNotificationCount
);
export const NotificationRoutes = router;
