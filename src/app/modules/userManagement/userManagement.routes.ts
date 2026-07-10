import express from "express";
import { USER_ROLES } from "../../../enums/user";
import auth from "../../middlewares/auth";
import { UserController } from "./userManagement.controller";


const router = express.Router();

router
  .route("/")
  .post(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    UserController.createUser
  )
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    UserController.getAllUsers
  );

  router
  router.route("/merchantrole").post(
  auth(USER_ROLES.MERCHANT,),
  UserController.createUser
);


router.get(
  "/merchants/all-users",
  auth(),
  UserController.getAllMerchants
);

router.get(
  "/merchants/:id",
  auth(),
  UserController.getSingleMerchant
);

router.patch(
  "/merchants/:id",
  auth(),
  UserController.updateMerchant
);

router.delete(
  "/merchants/:id",
  auth(),
  UserController.deleteMerchant
);

router.patch(
  "/merchants/:id/toggle-status",
  auth(),
  UserController.toggleMerchantStatus
);








router
  .route("/merchant")
  .post(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    UserController.createMerchant
  );



router
  .route("/:id")
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    UserController.getSingleUser
  )
  .patch(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    UserController.updateUser
  )
  .delete(
    auth(USER_ROLES.SUPER_ADMIN,),
    UserController.deleteUser
  );

// toggle active/inactive
router.patch(
  "/toggle/:id",
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  UserController.toggleUserStatus
);

export const UserManagementRoutes = router;
