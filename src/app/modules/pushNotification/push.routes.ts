import express from "express";
import { PushController } from "./push.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import fileUploadHandler from "../../middlewares/fileUploaderHandler";


const router = express.Router();

// Admin send push
router.post("/admin/notify", auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN), PushController.sendNotificationToAll);
// Merchant send promotion push
router.post(
  "/merchant/notify",
  auth(USER_ROLES.MERCHANT,USER_ROLES.ADMIN_MERCHANT),
  fileUploadHandler(), // multer for image
  PushController.sendMerchantPromotion
)




export const PushRoutes = router;


