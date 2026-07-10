import { Sell } from "../../app/modules/merchant/merchantSellManagement/merchantSellManagement.model";


export const getUserSegment = async (userId: string) => {
  const purchases = await Sell.find({ userId, status: "completed" }).sort({ createdAt: -1 });

  const totalPurchases = purchases.length;

  const last6Months = purchases.filter(
    (p) => new Date(p.createdAt) > new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)
  );

  const totalSpend = purchases.reduce((sum, p: any) => sum + p.totalBill, 0);

  const avgSpend = 10000;

  if (
    totalPurchases === 0 ||
    (totalPurchases === 1 &&
      purchases[0].createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
  ) {
    return "new_customer";
  }

  if (totalPurchases >= 2 && last6Months.length < 5) {
    return "returning_customer";
  }

  if (last6Months.length >= 20 || totalSpend >= 3 * avgSpend) {
    return "vip_customer";
  }

  if (last6Months.length >= 5 || totalSpend >= 1.5 * avgSpend) {
    return "loyal_customer";
  }

  return "all_customer";
};