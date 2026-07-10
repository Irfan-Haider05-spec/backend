import colors from "colors";
import { User } from "../app/modules/user/user.model";
import config from "../config";
import { USER_ROLES } from "../enums/user";
import { logger } from "../shared/logger";
import { createUniqueReferralId } from "../utils/generateReferralId";

const superUser = {
  firstName: "Super", 
  role: USER_ROLES.SUPER_ADMIN,
  phone: "+8801700000000", 
  email: config.admin.email,
  password: config.admin.password,
  verified: true,
};

const seedSuperAdmin = async () => {
  const isExistSuperAdmin = await User.findOne({
    role: USER_ROLES.SUPER_ADMIN,
  });

  if (!isExistSuperAdmin) {
    const referenceId = await createUniqueReferralId();
    const superUserData = {
      ...superUser,
      referenceId,
    };
    await User.create(superUserData);
    logger.info(colors.green("✔ Super admin created successfully!"));
  }
};

export default seedSuperAdmin;
