// src/app/modules/points/point.service.ts
import { TransactionHistory } from "./transaction.model";
import { Types } from "mongoose";

import QueryBuilder from "../../../utils/queryBuilder";

// Helper: Map Mongoose doc to clean object
// helper: map transaction document

const mapPointDoc = (doc: any) => ({
  id: doc._id.toString(),
  type: doc.type,
  points: doc.points,
  source: doc.source,
  subscription: doc.subscriptionId
    ? {
        id: doc.subscriptionId._id.toString(),
        title: doc.subscriptionId.title,
      }
    : null,
  balanceAfter: doc.balanceAfter,
  createdAt: doc.createdAt,
});

const createTransaction = async (payload: any) => {
  const doc = await TransactionHistory.create(payload);
  return mapPointDoc(doc);
};

const getTransactions = async (
  userId: string,
  query: any,
  type?: "EARN" | "USE"
) => {
  // Base query
  let baseQuery = TransactionHistory.find({ userId: new Types.ObjectId(userId) });

  if (type) {
    baseQuery = baseQuery.find({ type });
  }

  // Initialize QueryBuilder
  const qb = new QueryBuilder(baseQuery, query);

  qb.search(["source"]) // search by source
    .filter()
    .sort()
    .paginate()
    .fields()
    .populate(["subscriptionId"], { title: 1 }); // populate subscription title

  const docs = await qb.modelQuery.lean();

  const data = docs.map(mapPointDoc);
  const pagination = await qb.getPaginationInfo();

  return { data, pagination };
};

const getPointsSummary = async (userId: string) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const agg = await TransactionHistory.aggregate([
    { $match: { userId: new Types.ObjectId(userId) } },
    {
      $facet: {
        totalAvailable: [
          { $sort: { createdAt: 1 } },
          { $group: { _id: null, balance: { $last: "$balanceAfter" } } },
        ],
        thisMonthEarn: [
          { $match: { type: "EARN", createdAt: { $gte: startOfMonth } } },
          { $group: { _id: null, points: { $sum: "$points" } } },
        ],
      },
    },
  ]);

  return {
    totalAvailable: agg[0].totalAvailable[0]?.balance || 0,
    thisMonthEarn: agg[0].thisMonthEarn[0]?.points || 0,
  };
};

export const PointService = {
  createTransaction,
  getTransactions,
  getPointsSummary,
};
