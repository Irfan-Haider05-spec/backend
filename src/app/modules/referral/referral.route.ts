import express from "express";
import auth from "../../middlewares/auth";
import { ReferralController } from "./referral.controller";
import validateRequest from "../../middlewares/validateRequest";
import { ReferralValidation } from "./referral.validation";

const router = express.Router();

router.get("/mine", auth(), ReferralController.getMyReferredUser)
router.post("/verify-referral", validateRequest(ReferralValidation.verifyReferralZodSchema), ReferralController.verifyReferral);
export const ReferralRoutes = router