import express from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { AdminController } from "./admin.controller";
import validateRequest from "../../middlewares/validateRequest";
import { AdminValidation } from "./admin.validation";
import fileUploadHandler from "../../middlewares/fileUploaderHandler";
const router = express.Router();

router.post(
  "/create-admin",
  auth(USER_ROLES.SUPER_ADMIN),
  validateRequest(AdminValidation.createAdminZodSchema),
  AdminController.createAdmin
);

router.get(
  "/get-admin",
  auth(USER_ROLES.SUPER_ADMIN),
  AdminController.getAdmin
);

router.delete(
  "/:id",
  auth(USER_ROLES.SUPER_ADMIN),
  AdminController.deleteAdmin
);
router.patch(
  "/users/:id/status",
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  validateRequest(AdminValidation.updateUserStausZodSchema),
  AdminController.updateUserStatus
);

router.get(
  "/customers",
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN , USER_ROLES.VIEW_ADMIN, USER_ROLES.VIEW_MERCHANT, USER_ROLES.ADMIN_REP),
  AdminController.getAllCustomers
);

//=============== customer export ===================//
router.get(
  "/customers/export",
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  AdminController.exportCustomers
);




router.get(
  "/merchants",
  auth(),
  AdminController.getAllMerchants
);


router.get(
  "/merchant-sells/:merchantId",
  auth(  USER_ROLES.SUPER_ADMIN,  USER_ROLES.ADMIN,  USER_ROLES.VIEW_MERCHANT,  USER_ROLES.VIEW_ADMIN,  USER_ROLES.ADMIN_REP, USER_ROLES.ADMIN_SELL),
  AdminController.getMerchantCustomerStats
);

router.get(
  "/merchants/export",
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  AdminController.exportMerchants
);


router.get("/merchants/nearby", auth(), AdminController.getNearbyMerchantsController);

//===singel merchant details ===//
router.get(
  "/merchants/:id",
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  AdminController.getSingleMerchant
);

//=== update merchant ===//
router.patch(
  "/merchants/:id",
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  fileUploadHandler(), // <-- your upload middleware
  AdminController.updateMerchant
);

//=== delete merchant ===//
router.delete(
  "/merchants/:id",
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  AdminController.deleteMerchant
);

//=== merchant status update ===//
router.patch(
  "/merchants/status/:id",
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  AdminController.updateMerchantStatus
);

router.patch(
  "/merchants/:id/approve-status",
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  validateRequest(AdminValidation.updateMerchantApproveStatusZodSchema),
  AdminController.updateMerchantApproveStatus
);

// ========================= customer crue operations ========================= //

//=== all customers ===//
router.get(
  "/customers",
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.VIEW_MERCHANT,USER_ROLES.VIEW_ADMIN, USER_ROLES.ADMIN_REP, USER_ROLES.ADMIN_SELL),
  AdminController.getAllCustomers
);

router.get(
  "/customer-sells/:userId",
  auth(  USER_ROLES.SUPER_ADMIN,  USER_ROLES.ADMIN,  USER_ROLES.VIEW_MERCHANT,  USER_ROLES.VIEW_ADMIN,  USER_ROLES.ADMIN_REP, USER_ROLES.ADMIN_SELL),
  AdminController.getCustomerSellDetails
);


//===singel customer details ===//
router.get(
  "/customers/:id",
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  AdminController.getSingleCustomer
);

//=== update customer ===//
router.patch(
  "/customers/:id",
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  fileUploadHandler(),
  AdminController.updateCustomer
);

//=== delete customer ===//
router.delete(
  "/customers/:id",
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  AdminController.deleteCustomer
);

//=== customer status update ===//

router.patch(
  "/customers/:id/status",
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  AdminController.updateCustomerStatus
);

export const AdminRoutes = router;
