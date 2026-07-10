export const getUserTier = (tiers: any[], points: number, totalSpend: number) => {
  let userTier = null;

  for (const tier of tiers) {
    const minSpend = tier.minTotalSpend ?? 0;

    if (points >= tier.pointsThreshold && totalSpend >= minSpend) {
      userTier = tier;
    }
  }

  return userTier;
};