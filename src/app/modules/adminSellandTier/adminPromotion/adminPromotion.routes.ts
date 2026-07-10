import { Router } from "express";


import { PromotionController } from "./adminPromotion.controller";
import fileUploadHandler from "../../../middlewares/fileUploaderHandler";
import auth from "../../../middlewares/auth";
import { USER_ROLES } from "../../../../enums/user";



const router = Router();


router.post(
  "/",
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN,),
  fileUploadHandler(),
  PromotionController.createPromotion
);

router.get("/", auth(), PromotionController.getAllPromotions);



router.get("/user-promotions", auth(), PromotionController.getPromotionsForUser);


router.get("/:id", auth(), PromotionController.getSinglePromotion);

router.patch(
  "/:id",
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN,),
  fileUploadHandler(),
  PromotionController.updatePromotion
);

router.delete(
  "/:id",
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN,),
  PromotionController.deletePromotion
);

router.patch(
  "/toggle/:id",
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN,),
  PromotionController.togglePromotion
);

export const AdminPromoMerchantRoutes = router;
