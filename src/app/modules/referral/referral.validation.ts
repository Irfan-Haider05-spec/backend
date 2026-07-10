import z from "zod";

const verifyReferralZodSchema = z.object({
    body: z.object({
        referralId: z.string({ required_error: "Referral Id is required" }),
    }),
});

export const ReferralValidation = {
    verifyReferralZodSchema,
};