import { StatusCodes } from "http-status-codes";
import stripe from "../config/stripe";
import ApiError from "../errors/ApiErrors";
import { IPackage } from "../app/modules/package/package.interface";

export type StripeProductResult = {
  productId: string;
  priceId: string;
};

export const createSubscriptionProduct = async (
  payload: Partial<IPackage>
): Promise<StripeProductResult> => {
  const { title, price, duration, description } = payload;

  // 🔹 Validation
  if (!title || price === undefined || price === null || !duration) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Title, price, and duration are required"
    );
  }

  // 🔹 Free plan handle
  if (price === 0) {
    return {
      productId: "FREE_PLAN",
      priceId: "FREE_PLAN",
    };
  }

  // 1️⃣ Create Product in Stripe
  const product = await stripe.products.create({
    name: title,
    description: description ?? "",
  });

  // =========================
  // ✅ FIX START
  // =========================

  // 🔹 Extract number from duration (e.g. "4 months" → 4)
  const durationNumber = parseInt(
    duration.toString().match(/\d+/)?.[0] || "1"
  );

  // 🔹 Normalize duration string
  const lowerDuration = duration.toLowerCase();

  // 🔹 Detect interval type
  let interval: "month" | "year" = "month";

  if (lowerDuration.includes("year")) {
    interval = "year";
  } else if (lowerDuration.includes("month")) {
    interval = "month";
  }

  // =========================
  // ✅ FIX END
  // =========================

  // 2️⃣ Create Stripe Price (🔥 MAIN FIX HERE)
  const stripePrice = await stripe.prices.create({
    product: product.id,
    unit_amount: Math.round(price * 100), // cents
    currency: "usd",
    recurring: {
      interval,
      interval_count: durationNumber, // ✅ FIX: supports 4 months, 2 years, etc.
    },
  });

  return {
    productId: product.id,
    priceId: stripePrice.id,
  };
};
