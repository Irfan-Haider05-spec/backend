import express from "express";
import { USER_ROLES } from "../../../enums/user";
import auth from "../../middlewares/auth";
import { SalesRepController } from "./salesRep.controller";

import { SalesRepValidation } from "./salesRep.validation";
import validateRequest from "../../middlewares/validateRequest";

const router = express.Router();

router.post(
  "/",
  auth(),
  validateRequest(SalesRepValidation.createSalesRepDataZodSchema),
  SalesRepController.createSalesRepData
);
router.get(
  "/",
  auth(),
  SalesRepController.getSalesRepData
);
router.patch(
  "/:id/acknowledge",
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.ADMIN_SELL,),
  SalesRepController.updateUserAcknowledgeStatus
);
router.post(
  "/:id/token",
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN,USER_ROLES.ADMIN_REP),
  SalesRepController.generateToken
);
router.patch(
  "/:id/activate-account",
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.ADMIN_SELL),
  SalesRepController.activateAccount
)
router.patch(
  "/:id/deactivate-account",
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN,),
  SalesRepController.deactivateAccount
)
router.post(
  "/validate",
  auth(USER_ROLES.USER),
  validateRequest(SalesRepValidation.validateTokenZodSchema),
  SalesRepController.validateToken
);

export const SalesRepRoutes = router;
