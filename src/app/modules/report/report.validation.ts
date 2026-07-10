import { z } from "zod";
import { REPORT_STATUS } from "./report.interface";

// User creates a report
export const createReportZodSchema = z.object({
  body: z.object({
    reportedUserId: z.string({ required_error: "Reported User ID is required" }),
    reason: z.string({ required_error: "Reason is required" }),
  }),
});

// Admin updates a report
export const adminActionZodSchema = z.object({
  body: z.object({
    reportId: z.string({ required_error: "Report ID is required" }),
    status: z.nativeEnum(REPORT_STATUS, { required_error: "Status is required" }),
    warning: z.string().optional(),
  }),
});
