import { z } from "zod";

export const createPushZodSchema = z.object({
  title: z.string({ required_error: "Title is required" }).min(1, "Title cannot be empty"),
  body: z.string({ required_error: "Body is required" }).min(1, "Body cannot be empty"),
  state: z.string({ required_error: "State is required" }).min(1, "State cannot be empty"),
});
