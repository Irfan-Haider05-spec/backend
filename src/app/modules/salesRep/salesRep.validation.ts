import { z } from "zod";

const validateTokenZodSchema = z.object({
  body: z.object({
    token: z.string({ required_error: "Cash Token is required" }),
  }),
});
const createSalesRepDataZodSchema = z.object({
  body: z.object({
    packageId: z.string({ required_error: "Package Id is required" }),
  }),
});

export const SalesRepValidation = {
  validateTokenZodSchema,
  createSalesRepDataZodSchema,
};
