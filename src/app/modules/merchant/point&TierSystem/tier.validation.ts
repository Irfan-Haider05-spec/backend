import { z } from "zod";

// Create Tier Schema
export const createTierSchema = z.object({
  name: z.string().min(1, { message: "Tier name is required" }),
  
  pointsThreshold: z.coerce
    .number({ invalid_type_error: "Points threshold must be a number" })
    .nonnegative({ message: "Points threshold must be >= 0" }),

  // reward: z.string().min(1, { message: "Reward is required" }),

  accumulationRule: z.coerce
    .number({ invalid_type_error: "Accumulation rule must be a number" })
    .min(1, { message: "Accumulation rule must be >= 1" }),

  redemptionRule: z.coerce
    .number({ invalid_type_error: "Redemption rule must be a number" })
    .min(0, { message: "Redemption rule must be >= 0" }),

  minTotalSpend: z.coerce
    .number({ invalid_type_error: "Minimum total spend must be a number" })
    .nonnegative({ message: "Minimum total spend must be >= 0" }),

  isActive: z.coerce.boolean().optional(),
});

// Update Tier Schema
export const updateTierSchema = createTierSchema.partial();
