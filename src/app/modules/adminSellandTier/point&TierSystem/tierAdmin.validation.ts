import { z } from "zod";

export const createTierSchema = z.object({
  name: z.string().min(1, "Tier name is required"),
  pointsThreshold: z.coerce
    .number()
    .nonnegative("Points threshold must be >= 0"),
  accumulationRule: z.number().min(1, "Accumulation rule is required"),
  redemptionRule: z.number().min(0, "Redemption rule is required"),
  minTotalSpend: z.coerce
    .number()
    .nonnegative("Minimum total spend must be >= 0"),
  isActive: z.coerce.boolean().optional(),
});

export const updateTierSchema = createTierSchema.partial();
