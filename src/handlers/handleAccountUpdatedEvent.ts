import { StatusCodes } from "http-status-codes";
import Stripe from "stripe";
import ApiError from "../errors/ApiErrors";
import stripe from "../config/stripe";
import { User } from "../app/modules/user/user.model";

export const handleAccountUpdatedEvent = async (data: Stripe.Account) => {
  try {
    // Find the user by Stripe account ID
    const existingUser = await User.findOne({
      "stripeAccountInfo.accountId": data.id,
    });

    if (!existingUser) {
      console.warn(`⚠️ No user found for account ID: ${data.id}`);
      return; // ❌ Error throw করার দরকার নেই, শুধু log করাই যথেষ্ট
    }

    // Always prepare update object
    const updateData: any = {
      "stripeAccountInfo.accountId": data.id,
      "stripeAccountInfo.detailsSubmitted": data.details_submitted,
      "stripeAccountInfo.chargesEnabled": data.charges_enabled,
      "stripeAccountInfo.payoutsEnabled": data.payouts_enabled,
    };

    // If account is active and charges enabled, create a login link
    if (data.charges_enabled) {
      const loginLink = await stripe.accounts.createLoginLink(data.id);
      updateData["stripeAccountInfo.loginUrl"] = loginLink.url;
    }

    // Save updates to DB
    await User.findByIdAndUpdate(existingUser._id, updateData, {
      new: true,
      runValidators: true,
    });

  } catch {

    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Account update failed");
  }
};
