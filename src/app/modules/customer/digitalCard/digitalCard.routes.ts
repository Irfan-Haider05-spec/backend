import { Router } from "express";


import auth from "../../../middlewares/auth";
import { USER_ROLES } from "../../../../enums/user";
import { DigitalCardController } from "./digitalCard.controller";


const router = Router();

// router.post("/add", auth(), DigitalCardController.addPromotion);
router.post("/add", auth(USER_ROLES.USER), DigitalCardController.addPromotion);

router.post( "/create-digital-card",
  auth(USER_ROLES.USER),
  DigitalCardController.createOrGetUserDigitalCard
);

router.get("/my-promotions", auth(USER_ROLES.USER), DigitalCardController.getUserAddedPromotions);
router.get("/my-digital-cards", auth(USER_ROLES.USER), DigitalCardController.getUserDigitalCards);
router.get(
  "/digital-card/:digitalCardId",
  auth(),
  DigitalCardController.getDigitalCardPromotions
);

// router.post(
//   "/user/approve-promotion",
//   auth(USER_ROLES.USER),
//   DigitalCardController.approvePromotion
// );



router.get(
  "/find",
  auth(USER_ROLES.MERCHANT, USER_ROLES.ADMIN_MERCHANT),
  DigitalCardController.getMerchantDigitalCard
);

router.post(
  "/test",
  
)

export const DigitalCardRoutes = router;

