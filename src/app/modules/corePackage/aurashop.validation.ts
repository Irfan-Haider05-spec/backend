import { z } from "zod";

export const createPackageSchema = z.object({
  title: z.string(),
  description: z.string(),
  price: z.number(),
  duration: z.enum(["1 day","1 week","1 month","3 months","6 months","1 year"])
});
