import { StatusCodes } from 'http-status-codes';
import Stripe from 'stripe';
import ApiError from '../errors/ApiErrors';
import stripe from '../config/stripe';
import { Subscription } from '../app/modules/subscription/subscription.model';
import { User } from '../app/modules/user/user.model';
// import { Package } from '../app/modules/package/package.model';
import { Package } from '../app/modules/package/package.model';






// ==============================
// handleSubscriptionCreated
// ==============================
// ======= Updated handleSubscriptionCreated =======
export const handleSubscriptionCreated = async (data: Stripe.Subscription) => {

  try {
    const subscription = await stripe.subscriptions.retrieve(data.id);
    const customer = (await stripe.customers.retrieve(subscription.customer as string)) as Stripe.Customer;
    if (!customer?.email) throw new ApiError(StatusCodes.BAD_REQUEST, 'No email found for the customer!');

    const existingUser = await User.findOne({ email: customer.email });
    if (!existingUser) throw new ApiError(StatusCodes.NOT_FOUND, `User not found: ${customer.email}`);

    const priceId = subscription.items.data[0]?.price?.id;
    const allPackages = await Package.find({});
    const pricingPlan = allPackages.find(pkg =>
      pkg.priceId === priceId || Object.values(pkg.priceIdWithPoints || {}).includes(priceId)
    );
    if (!pricingPlan) throw new ApiError(StatusCodes.NOT_FOUND, `Pricing plan not found for priceId: ${priceId}`);

    // ====== Invoice & Pricing ======
    const invoice = await stripe.invoices.retrieve(subscription.latest_invoice as string);
    const trxId = invoice?.payment_intent as string;
    const amountPaid = invoice?.total ? invoice.total / 100 : 0;

    const mainPrice = pricingPlan.price; // package মূল দাম
    const currentPrice = amountPaid;     // subscription শেষ দাম
    const priceDifference = mainPrice - currentPrice; // points হিসেবে deduct হবে


    // ====== Deduct points from user ======
    if (priceDifference > 0) {
      const pointsToDeduct = Math.min(priceDifference, existingUser.points || 0); // user points check
      if (pointsToDeduct > 0) {
        await User.findByIdAndUpdate(existingUser._id, {
          $inc: { points: -pointsToDeduct },
        });
      }
    }




    // ====== Subscription period & save ======
    const currentPeriodStart = subscription.current_period_start;
    const currentPeriodEnd = subscription.current_period_end;
    const subscriptionId = subscription.id;
    const remaining = subscription.items.data[0].quantity || 1;

    const existingSubscription = await Subscription.findOne({
      user: existingUser._id,
      package: pricingPlan._id,
      subscriptionId
    });
    if (existingSubscription) {

      return;
    }

    const newSubscription = new Subscription({
      user: existingUser._id,
      customerId: customer.id,
      package: pricingPlan._id,
      status: 'active',
      trxId,
      amountPaid: currentPrice,
      price: mainPrice,
      subscriptionId,
      currentPeriodStart: new Date(currentPeriodStart * 1000).toISOString(),
      currentPeriodEnd: new Date(currentPeriodEnd * 1000).toISOString(),
      remaining,
      source: 'online',
    });

    await newSubscription.save();
    await User.findByIdAndUpdate(existingUser._id, { subscription: 'active' });
  

  } catch (error) {
  
    throw error;
  }
};


