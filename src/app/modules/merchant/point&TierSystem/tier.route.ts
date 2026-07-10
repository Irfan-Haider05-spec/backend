import { Router } from "express";
import { TierController } from "./tier.controller";
import { USER_ROLES } from "../../../../enums/user";
import auth from "../../../middlewares/auth";




const router = Router();

router.route("/")
  .get(auth(),  TierController.getTier)
  .post(auth(USER_ROLES.MERCHANT,USER_ROLES.ADMIN_MERCHANT), TierController.createTier);

router.route("/:id")
  .get(auth(USER_ROLES.VIEW_MERCHANT,USER_ROLES.MERCHANT,USER_ROLES.USER), TierController.getSingleTier)
  .patch(auth(USER_ROLES.MERCHANT,USER_ROLES.ADMIN_MERCHANT), TierController.updateTier)
  .delete(auth(USER_ROLES.MERCHANT,USER_ROLES.ADMIN_MERCHANT), TierController.deleteTier);
router.route("/merchant/:userId")
  .get(  TierController.getTierByUserId);


export const TierRoutes = router;
