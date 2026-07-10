import express from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { AuditController } from "./audit.controller";

const router = express.Router();

router.get(
  "/audit-logs",
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  AuditController.getAuditLogs
);
router.get(
  "/audit-log/tier",
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  AuditController.getAuditLogTier
);


router.get(
  "/audit-logs/user",
  auth(),
  AuditController.getAuditLogsByUser
);



export const AuditRoutes = router;
