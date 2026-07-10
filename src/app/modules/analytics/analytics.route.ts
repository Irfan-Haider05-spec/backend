import express from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { AnalyticsController } from "./analytics.controller";

const router = express.Router();

router.get(
  "/business-customer",
  auth(),
  AnalyticsController.getBusinessCustomerAnalytics
);

router.get(
  "/business-customer/export",
  auth(USER_ROLES.MERCHANT,USER_ROLES.VIEW_MERCHANT,USER_ROLES.ADMIN_MERCHANT),
  AnalyticsController.exportBusinessCustomerAnalytics
);



router.get(
  "/merchant",
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN ,USER_ROLES.VIEW_ADMIN,USER_ROLES.ADMIN_REP),
  AnalyticsController.getMerchantAnalytics
);


router.get(
  "/merchants/export",
  auth(USER_ROLES.MERCHANT, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN , USER_ROLES.ADMIN_REP), // Only admins
  AnalyticsController.exportMerchantAnalytics
);


router.get(
  "/merchant/monthly/export",
  auth(),
  AnalyticsController.exportMerchantMonthlyAnalytics
);


router.get(
  "/customer",
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN ,USER_ROLES.VIEW_ADMIN,USER_ROLES.ADMIN_REP),
  AnalyticsController.getCustomerAnalytics
);

router.get(
  "/customer/export",
  // auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  AnalyticsController.exportCustomerAnalytics
);

router.get(
  "/customer/monthly/export",
  // auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  AnalyticsController.exportCustomerMonthlyData
);

router.get("/accountings/point-redeemed", auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN,USER_ROLES.VIEW_ADMIN,USER_ROLES.ADMIN_REP), AnalyticsController.getPointRedeemedAnalytics)
router.get("/accountings/point-redeemed/export", auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), AnalyticsController.exportPointRedeemedAnalytics)
router.get("/accountings/revenue-per-user", auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN ,USER_ROLES.ADMIN_REP), AnalyticsController.getRevenuePerUser)
router.get("/accountings/revenue-per-user/export", auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN,USER_ROLES.ADMIN_REP), AnalyticsController.exportRevenuePerUser)
router.get("/accountings/cash-collection", auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN,USER_ROLES.VIEW_ADMIN,USER_ROLES.ADMIN_REP), AnalyticsController.getCashCollectionAnalytics)
router.get("/accountings/cash-collection/export", auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN,USER_ROLES.ADMIN_REP), AnalyticsController.exportCashCollectionAnalytics)
router.get("/accountings/cash-receivable", auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN,USER_ROLES.VIEW_ADMIN,USER_ROLES.ADMIN_REP), AnalyticsController.getCashReceivableAnalytics)
router.get("/accountings/cash-receivable/export", AnalyticsController.exportCashReceivableAnalytics)
export const AnalyticsRoutes = router;
