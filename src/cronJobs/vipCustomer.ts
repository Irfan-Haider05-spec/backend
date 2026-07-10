
import { Types } from "mongoose";
import { MerchantCustomer } from "../app/modules/merchant/merchantCustomer/merchantCustomer.model";
import { logger } from "../shared/logger";

export const updateMerchantVipCustomersJob = async (): Promise<void> => {
    try {
        const merchants = (await MerchantCustomer.distinct(
            "merchantId"
        )) as Types.ObjectId[];

        for (const merchantId of merchants) {
            try {
                await updateMerchantVipCustomers(merchantId);
            } catch (error) {
                logger.error(
                    `[CRON] Failed to update VIP customers for merchant ${merchantId}`,
                    error
                );
            }
        }
    } catch (error) {
        logger.error("[CRON] Failed to fetch merchant list", error);
        throw error;
    }
};

const updateMerchantVipCustomers = async (
    merchantId: Types.ObjectId
): Promise<void> => {
    const result = await MerchantCustomer.aggregate([
        { $match: { merchantId } },
        { $sort: { totalSpend: -1, totalOrders: -1 } },
        {
            $group: {
                _id: null,
                ids: { $push: "$_id" },
                count: { $sum: 1 },
            },
        },
        {
            $project: {
                vipIds: {
                    $slice: [
                        "$ids",
                        {
                            $max: [
                                1,
                                { $ceil: { $multiply: ["$count", 0.1] } },
                            ],
                        },
                    ],
                },
            },
        },
    ]);

    const vipIds: Types.ObjectId[] = result[0]?.vipIds || [];

    await MerchantCustomer.updateMany(
        { merchantId },
        { $set: { isVip: false } }
    );

    if (vipIds.length) {
        await MerchantCustomer.updateMany(
            { _id: { $in: vipIds } },
            { $set: { isVip: true } }
        );
    }
};