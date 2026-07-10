// role.routes.ts
import express from "express";

import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { RoleController } from "./role.controller";

const router = express.Router();

router.post("/", 
    auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN), 
    RoleController.createRole);

router.get("/",
     auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
      RoleController.getRoles
    );

export const RoleRoutes = router;
