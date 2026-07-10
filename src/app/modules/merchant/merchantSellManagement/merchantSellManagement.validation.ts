// merchantSellManagement.validation.ts
import { z } from "zod";

export const findCustomerSchema = z.object({
  cardId: z.string().min(1),
});

export const calculateSchema = z.object({
  totalBill: z.coerce.number().nonnegative(),
  redeemPoints: z.coerce.number().nonnegative().optional(),
  giftCardCode: z.string().optional(),
  pointRedeemed: z.coerce.number().nonnegative().optional(),
});

export const completeTransactionSchema = z.object({
  merchantId: z.string().optional(),
  customerId: z.string(),
  totalBill: z.coerce.number().nonnegative(),
  redeemPoints: z.coerce.number().nonnegative().optional().default(0),
  pointRedeemed: z.coerce.number().nonnegative().optional().default(0),
  giftCardCode: z.string().optional(),
});
