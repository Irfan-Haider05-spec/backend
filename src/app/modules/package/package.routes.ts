import express from "express";
import { PackageController } from "./package.controller";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { PackageValidation } from "./package.validation";
import fileUploadHandler from "../../middlewares/fileUploaderHandler";
// import { authWithPageAccess } from "../../middlewares/authWithPageAccess";
import { USER_ROLES } from "../../../enums/user";

const router = express.Router();

router.route("/")
    .post(
        fileUploadHandler(),
        auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
        validateRequest(PackageValidation.createPackageZodSchema),
        PackageController.createPackage
    )
    .get(PackageController.getPackage);

router.get("/active-packages", PackageController.getActivePackages);

router.route("/:id")
    .get(auth(), PackageController.getSinglePackage)
    .patch(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), PackageController.updatePackage)
    .delete(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), PackageController.deletePackage);
router.patch(
    "/toggle/:id",
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    PackageController.togglePackageStatus
);

export const PackageRoutes = router;
