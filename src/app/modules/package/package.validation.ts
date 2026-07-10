import { z } from 'zod';

const createPackageZodSchema = z.object({
    body: z.object({
        title: z.string({ required_error: "Title is required" }),
        description: z.string({ required_error: "Description is required" }),
        price: z.union([z.string(), z.number()])
        .transform(val => typeof val === 'string' ? parseFloat(val) : val)
        .refine(val => !isNaN(val), { message: "Price must be a valid number" })
        .refine(val => val >= 0, { message: "Price cannot be negative" }),

        duration: z.enum(["1 month", "4 months", "8 months", "1 year"], { required_error: "Duration is required" }),
        // paymentType: z.enum(["Monthly", "Yearly"], { required_error: "Payment type is required" }),
        features: z.array(z.string(), { required_error: "Features are required" }),
        loginLimit: z.number({ required_error: "Login limit is required" }).min(1),
        credit: z.number({ required_error: "Credit is required" }).min(0),
    })
});

export const PackageValidation = { createPackageZodSchema };
