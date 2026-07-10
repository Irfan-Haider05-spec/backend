import express from "express";
import { USER_ROLES } from "../../../enums/user";
import auth from "../../middlewares/auth";
import { MerchantUserManagementController } from "./merchantUserManagement.controller";


const router = express.Router();

// ---------------- Create User ----------------
router.post(
  "/create-user",
  auth(USER_ROLES.MERCHANT, USER_ROLES.ADMIN_MERCHANT),
  MerchantUserManagementController.createUser
);

// ---------------- Get All Users (merchant's own) ----------------
router.get(
  "/users",
  auth(USER_ROLES.MERCHANT, USER_ROLES.ADMIN_MERCHANT),
  MerchantUserManagementController.getMyUsers
);

// ---------------- Get Single User ----------------
router.get(
  "/users/:id",
  auth(USER_ROLES.MERCHANT, USER_ROLES.ADMIN),
  MerchantUserManagementController.getSingleUser
);

// ---------------- Update User ----------------
router.patch(
  "/users/:id",
  auth(USER_ROLES.MERCHANT, USER_ROLES.ADMIN),
  MerchantUserManagementController.updateUser
);

// ---------------- Delete User ----------------
router.delete(
  "/users/:id",
  auth(USER_ROLES.MERCHANT, USER_ROLES.ADMIN),
  MerchantUserManagementController.deleteUser
);

// ---------------- Toggle Active / Inactive ----------------
router.patch(
  "/users/toggle-status/:id",
  auth(USER_ROLES.MERCHANT, USER_ROLES.ADMIN),
  MerchantUserManagementController.toggleUserStatus
);

export const MerchantUserManagement = router;
