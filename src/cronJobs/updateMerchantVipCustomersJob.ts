import { subMinutes } from "date-fns";
import { DigitalCard } from "../app/modules/customer/digitalCard/digitalCard.model";
import { Tier } from "../app/modules/merchant/point&TierSystem/tier.model";
import { logger } from "../shared/logger";

export const downgradeInactiveTiers = async () => {
  try {
    const oneMinuteAgo = subMinutes(new Date(), 1);
    // Find inactive cards
    const inactiveCards = await DigitalCard.find({
      updatedAt: { $lt: oneMinuteAgo },
    });

    if (!inactiveCards.length) {
      return;
    }
  
    for (const card of inactiveCards) {
      // Fetch merchant tiers
      const merchantTiers = await Tier.find({
        admin: card.merchantId,
        isActive: true,
      })
        .sort({ pointsThreshold: 1 })
        .lean();

      if (!merchantTiers.length) {
        continue;
      }

      // Find current tier
      let currentTierIndex = 0;

      for (let i = 0; i < merchantTiers.length; i++) {
        if (card.lifeTimeEarnPoints >= merchantTiers[i].pointsThreshold) {
          currentTierIndex = i;
        } else {
          break;
        }
      }


      // Already lowest tier
      if (currentTierIndex === 0) {
        continue;
      }

      // Downgrade
      const lowerTier = merchantTiers[currentTierIndex - 1];

      // Update card
      card.lifeTimeEarnPoints = lowerTier.pointsThreshold;
      card.tier = lowerTier.name;

      await card.save();
    }
  } catch (err) {

    logger.error("Something failed", err);
  }
};