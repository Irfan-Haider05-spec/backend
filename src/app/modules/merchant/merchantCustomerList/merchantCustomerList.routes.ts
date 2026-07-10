import { Router } from "express"; // <-- express থেকে Router import করো
import { USER_ROLES } from "../../../../enums/user";
import auth from "../../../middlewares/auth";
import { MemberController } from "./merchantCustomerList.controller";

const router = Router(); // 

// all members
router.get(
  "/members",
  auth(USER_ROLES.MERCHANT, USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  MemberController.getAllMembers
);

// single member
router.get(
  "/members/:userId",
  auth(USER_ROLES.MERCHANT, USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  MemberController.getSingleMember
);

router.get("/customers/:id/tier", auth(USER_ROLES.MERCHANT, USER_ROLES.ADMIN_MERCHANT,USER_ROLES.VIEW_MERCHANT), MemberController.getSingleMemberTier)
export const MerchantCustomerListRoutes = router;
