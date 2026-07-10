import { z } from "zod";
import { APPROVE_STATUS, USER_STATUS } from "../../../enums/user";

const createAdminZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Name is required" }),
    email: z
      .string({ required_error: "Email is required" })
      .email({ message: "Invalid email address" }),
    password: z.string({ required_error: "Password is required" }),
    role: z.string({ required_error: "Role is required" }),
  }),
});
const updateUserStausZodSchema = z.object({
  body: z.object({
    status: z.nativeEnum(USER_STATUS),
  }),
});
const updateMerchantApproveStatusZodSchema = z.object({
  body: z.object({
    approveStatus: z.nativeEnum(APPROVE_STATUS),
  }),
});

export const AdminValidation = {
  createAdminZodSchema,
  updateUserStausZodSchema,
  updateMerchantApproveStatusZodSchema,
};
