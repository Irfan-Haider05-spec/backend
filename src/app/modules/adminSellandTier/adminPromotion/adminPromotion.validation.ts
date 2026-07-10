import { z } from "zod";

// Allowed days
const allowedDays = [
  "all",
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
] as const;

// Create Promotion Schema
export const createPromotionSchema = z.object({
  name: z.string().min(1, "Promotion name is required"),
  discountPercentage: z.number({
    invalid_type_error: "Discount percentage must be a number",
  }),
  promotionType: z.string().min(1, "Promotion type is required"),
  customerSegment: z.string().min(1, "Customer segment is required"),
  startDate: z.preprocess((arg) => new Date(arg as string), z.date()),
  endDate: z.preprocess((arg) => new Date(arg as string), z.date()),
  availableDays: z
    .array(z.enum(allowedDays))
    .nonempty("At least one day must be selected")
    .optional(), // optional field, default will be ["all"]
  image: z.string().optional(),
});

// Update Promotion Schema (partial)
export const updatePromotionSchema = createPromotionSchema.partial();

const getUserTierOfMerchantZodSchema = z.object({
  body: z.object({
    merchantId: z.string().min(1, { message: "Merchant id is required" }),
  }),
});

export const PromotionValidations = {
  getUserTierOfMerchantZodSchema,
};
