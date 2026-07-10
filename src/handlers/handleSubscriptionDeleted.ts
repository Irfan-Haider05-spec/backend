import Stripe from "stripe";
import { Subscription } from "../app/modules/subscription/subscription.model";
import { User } from "../app/modules/user/user.model";

export const handleSubscriptionDeleted = async (data: Stripe.Subscription) => {
  try {
    // Find active subscription by subscriptionId & customerId
    const activeSub = await Subscription.findOne({
      subscriptionId: data.id,
      customerId: data.customer as string,
      status: "active",
    });

    if (!activeSub) {
      console.warn(`⚠️ No active subscription found for ID: ${data.id}`);
      return;
    }

    // Update subscription status -> expired
    await Subscription.findByIdAndUpdate(
      activeSub._id,
      { status: "expired" }, // 🔥 enum অনুযায়ী expired
      { new: true }
    );

    // Disable user access
    await User.findByIdAndUpdate(activeSub.user, { hasAccess: false }, { new: true });

 
  } catch {


  }
};
