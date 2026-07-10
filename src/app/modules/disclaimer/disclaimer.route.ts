import express from "express";
import { DisclaimerController } from "./disclaimer.controller";
import validateRequest from "../../middlewares/validateRequest";
import { DisclaimerValidations } from "./disclaimer.validation";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";

const router = express.Router();

// get disclaimer by type
router.get(
  "/:type",
  validateRequest(DisclaimerValidations.getDisclaimerByTypeZodSchema),
  DisclaimerController.getDisclaimerByType
);
// create or update disclaimer
router.post(
  "/",
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(DisclaimerValidations.createUpdateDisclaimerZodSchema),
  DisclaimerController.createUpdateDisclaimer
);


export const DisclaimerRoutes = router;
