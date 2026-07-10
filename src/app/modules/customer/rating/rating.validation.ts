import { z } from "zod";

export const createRatingValidation = z.object({
  body: z.object({
    digitalCardId: z.string(),
    promotionId: z.string(),
    merchantId: z.string(),
    rating: z.number().min(1).max(5),
    comment: z.string().optional(),
  }),
});
