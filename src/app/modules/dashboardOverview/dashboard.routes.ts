import { Router } from "express";
import { DashboardController } from "./dashboard.controller";

import { USER_ROLES } from "../../../enums/user";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { DashboardValidation } from "./dashboard.validation";

const router = Router();

router.get(
  "/total-revenue",
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(DashboardValidation.totalRevenueZodSchema),
  DashboardController.getTotalRevenue
);
router.get(
  "/admin-statistics",
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(DashboardValidation.getStatisticsForAdminDashboardZodSchema),
  DashboardController.getStatisticsForAdminDashboard
);
router.get(
  "/yearly-revenue",
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(DashboardValidation.getYearlyRevenueZodSchema),
  DashboardController.getYearlyRevenue
);

export const DashboardRoutes = router;
