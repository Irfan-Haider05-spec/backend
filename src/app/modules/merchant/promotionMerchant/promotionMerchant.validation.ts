import { z } from "zod";
import { CUSTOMER_SEGMENT } from "../../../../enums/user";

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
  grossValue: z.number({
    invalid_type_error: "Gross value must be a number",
  }),
});

// Update Promotion Schema (partial)
export const updatePromotionSchema = createPromotionSchema.partial();

const getUserTierOfMerchantZodSchema = z.object({
  body: z.object({
    merchantId: z.string().min(1, { message: "Merchant id is required" }),
  }),
});


const sendNotificationToCustomerZodSchema = z.object({
  body: z.object({
    segment: z.nativeEnum(CUSTOMER_SEGMENT),
    minPoints: z.coerce.number(),
    radiusKm: z.coerce.number().min(1, { message: "Location radius is required" }),
    message: z.string().min(1, { message: "Message is required" }),

  }),
});
export const PromotionValidations = {
  getUserTierOfMerchantZodSchema,
  sendNotificationToCustomerZodSchema,

};
