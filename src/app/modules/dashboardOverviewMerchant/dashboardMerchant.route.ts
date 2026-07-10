import { Router } from "express";

import { USER_ROLES } from "../../../enums/user";
import auth from "../../middlewares/auth";

import { DashboardMerchantController } from "./dashboardMerchant.controller";


const router = Router();

router.get(
  "/merchant-dashboard-report",
  auth(USER_ROLES.MERCHANT,USER_ROLES.VIEW_MERCHANT,USER_ROLES.ADMIN_MERCHANT),
  DashboardMerchantController.getMerchantReport
);

router.get(
  "/weekly-sell-report",
  auth(USER_ROLES.MERCHANT,USER_ROLES.VIEW_MERCHANT,USER_ROLES.ADMIN_MERCHANT),
  DashboardMerchantController.getWeeklySellReport
);

router.get(
  "/today-new-members",
  auth(USER_ROLES.MERCHANT, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  DashboardMerchantController.getTodayNewMembers
);
router.get(
  "/customer-chart",
  auth(USER_ROLES.MERCHANT,USER_ROLES.VIEW_MERCHANT,USER_ROLES.ADMIN_MERCHANT),
  DashboardMerchantController.getCustomerChart
);
router.get(
  "/customer-chart-week",
  auth(USER_ROLES.MERCHANT,USER_ROLES.VIEW_MERCHANT,USER_ROLES.ADMIN_MERCHANT),
  DashboardMerchantController.getCustomerChartWeek
);

export const DashboardMerchantRoutes = router;
