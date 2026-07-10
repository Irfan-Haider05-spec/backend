import { z } from "zod";

export const addFavoriteValidation = z.object({
  body: z.object({
    merchantId: z.string(),
  }),
});
