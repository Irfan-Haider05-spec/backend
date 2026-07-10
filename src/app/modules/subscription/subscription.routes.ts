import express from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { SubscriptionController } from "./subscription.controller";
const router = express.Router();



router.post(
    "/create",
    auth(),
    SubscriptionController.createSubscription
);



router.post(
  "/cancel",
  auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
  SubscriptionController.cancelSubscription
);


router.get("/", 
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), 
    SubscriptionController.subscriptions
);

router.get("/details", 
    auth(USER_ROLES.USER,), 
    SubscriptionController.subscriptionDetails
);

router.get("/:id", 
    auth(USER_ROLES.USER, ), 
    SubscriptionController.companySubscriptionDetails
)

export const SubscriptionRoutes = router;