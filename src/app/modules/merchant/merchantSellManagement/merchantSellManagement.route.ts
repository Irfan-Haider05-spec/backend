import express from "express";
import auth from "../../../middlewares/auth";
import { USER_ROLES } from "../../../../enums/user";
import merchantSellManagementController from "./merchantSellManagement.controller";



const router = express.Router();

router.post("/checkout", auth(USER_ROLES.MERCHANT,USER_ROLES.ADMIN_MERCHANT), merchantSellManagementController.checkout);

router.get("/pending-checkouts", auth(USER_ROLES.USER), merchantSellManagementController.getLastPendingSell);



// Merchant → Request Approval
router.post("/promotion/request-approval", auth(USER_ROLES.MERCHANT,USER_ROLES.ADMIN_MERCHANT), merchantSellManagementController.requestApproval);

// User → Get Pending Promotions
router.get("/promotion/pending", auth(), merchantSellManagementController.getPendingRequests);

// User → Approve / Reject Promotion
router.post("/promotion/accept", auth(USER_ROLES.USER), merchantSellManagementController.approvePromotion);
router.post("/promotion/reject", auth(USER_ROLES.USER), merchantSellManagementController.approvePromotionreject);

// User sees points transaction history
router.get(
  "/points-history",
  auth(),
  merchantSellManagementController.getPointsHistory
);


// Get full transactions of a user (merchant)
router.get(
  "/transactions/:userId",
  auth(),
  merchantSellManagementController.getUserFullTransactions
);

router.get(
  "/merchant",
  auth(USER_ROLES.MERCHANT,USER_ROLES.VIEW_MERCHANT,USER_ROLES.ADMIN_MERCHANT),
  merchantSellManagementController.getMerchantSales
);

router.get(
  "/customer",
  auth(USER_ROLES.MERCHANT, USER_ROLES.VIEW_MERCHANT,USER_ROLES.USER, USER_ROLES.ADMIN_MERCHANT),
  merchantSellManagementController.getMerchantCustomersList
);
router.get(
  "/recent-new/customer",
  auth(USER_ROLES.MERCHANT, USER_ROLES.VIEW_MERCHANT,USER_ROLES.USER, USER_ROLES.ADMIN_MERCHANT),
  merchantSellManagementController.getRecentMerchantCustomersList
);

router.get(
  "/customer/export",
  auth(USER_ROLES.MERCHANT, USER_ROLES.ADMIN_MERCHANT),
  merchantSellManagementController.exportMerchantCustomersExcel
);


export const SellManagementRoute = router;
