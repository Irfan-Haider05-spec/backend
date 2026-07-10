
import { z } from "zod";

const totalRevenueZodSchema = z.object({
  query: z.object({
    start: z.preprocess(
      (val) => (val ? new Date(val as string) : undefined),
      z.date({
        required_error: "Start Date is required",
      })
    ),
    end: z.preprocess(
      (val) => (val ? new Date(val as string) : undefined),
      z.date({
        required_error: "End Date is required",
      })
    ),
  }),
});

const getStatisticsForAdminDashboardZodSchema = z.object({
  query: z.object({
    range: z.enum(["today", "7d", "30d", "all"]).optional().default("7d"),
  }),
});
const getYearlyRevenueZodSchema = z.object({
  query: z.object({
    start: z
      .preprocess(
        (val) => (val ? new Date(val as string) : undefined),
        z.date({
          message: "Start Date is invalid",
        })
      )
      .optional(),
    end: z
      .preprocess(
        (val) => (val ? new Date(val as string) : undefined),
        z.date({
          required_error: "End Date is invalid",
        })
      )
      .optional(),
  }),
});

export const DashboardMerchantValidation = {
  totalRevenueZodSchema,
  getStatisticsForAdminDashboardZodSchema,
  getYearlyRevenueZodSchema,
};
