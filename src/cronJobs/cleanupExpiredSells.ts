
import { Sell } from "../app/modules/merchant/merchantSellManagement/merchantSellManagement.model";
import { logger } from "../shared/logger";

export const cleanupExpiredSells = async () => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const result = await Sell.deleteMany({
      status: { $in: ["pending", "expired"] },
      createdAt: { $lte: fiveMinutesAgo },
    });

    if (result.deletedCount && result.deletedCount > 0) {
      logger.info(`[CRON] Deleted ${result.deletedCount} expired/pending sells`);
    }
  } catch (error) {
    logger.error("[CRON] Sell cleanup failed", error);
  }
};