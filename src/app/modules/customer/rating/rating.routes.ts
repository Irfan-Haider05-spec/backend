import express from "express";

import { createRatingValidation } from "./rating.validation";
import { RatingController } from "./rating.controller";
import auth from "../../../middlewares/auth";
import validateRequest from "../../../middlewares/validateRequest";
import { USER_ROLES } from "../../../../enums/user";

const router = express.Router();

//  User approves promotion → give rating
router.post(
  "/give-rating",
  auth(),
  validateRequest(createRatingValidation),
  RatingController.addRating
);

//  Merchant get all ratings
router.get(
  "/merchant/:merchantId",
  auth(USER_ROLES.MERCHANT),
  RatingController.getMerchantRatings
);

router.get("/merchant/average-rating/:merchantId", auth(), RatingController.getMerchantAverageRating);

export const RatingRoutes = router;
