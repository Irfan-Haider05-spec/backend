
import { AuditLog } from "./audit.model";
import QueryBuilder from "../../../utils/queryBuilder";
import { User } from "../user/user.model";
import { Types } from "mongoose";


const createLog = async (
  userIdOrEmail: string,
  actionType: string,
  details: string
) => {
  let userId: Types.ObjectId | undefined;
  let email: string | null = null;

  // ✅ যদি valid ObjectId হয়
  if (Types.ObjectId.isValid(userIdOrEmail)) {
    const user = await User.findById(userIdOrEmail).select("email");
    if (user) {
      userId = user._id;
      email = user?.email ?? null;

    }
  } else {

    email = userIdOrEmail;
  }

  const log = await AuditLog.create({
    actionType,
    details,
    user: userId,
    email,
  });

  return log;
};


const getAllLogsExceptMerchant = async (query: Record<string, unknown>) => {
  const merchants = await User.find({ role: "merchant" }, { _id: 1 });
  const merchantIds = merchants.map(m => m._id.toString());

  const auditQuery = new QueryBuilder(
    AuditLog.find({
      $or: [
        { user: { $exists: false } },
        { user: { $nin: merchantIds } },
      ],
    }),
    query
  )
    .search(["actionType", "details"])
    .filter()
    .sort()
    .paginate();

  const result = await auditQuery.modelQuery;
  const pagination = await auditQuery.getPaginationInfo();

  return {
    meta: pagination,
    data: result,
  };
};


const getAllLogsExceptMerchantTier = async (query: Record<string, unknown>) => {


  const allowedRoles = ["VIEW_ADMIN", "ADMIN_SELL", "ADMIN_REP", "SUPER_ADMIN", "ADMIN"];

  const users = await User.find({ role: { $in: allowedRoles } }, { _id: 1 });
  const userIds = users.map(u => u._id); 


  const auditQuery = new QueryBuilder(
    AuditLog.find({
      user: { $in: userIds },
      actionType: { $in: ["CREATE_TIER", "UPDATE_TIER", "DELETE_TIER"] },
    }),
    query
  )
    .search(["actionType", "details"])
    .filter()
    .sort()
    .paginate();

  const result = await auditQuery.modelQuery;
;

  const pagination = await auditQuery.getPaginationInfo();


  return {
    meta: pagination,
    data: result,
  };
};



const getLogsByUserId = async (
  userId: string,
  query: Record<string, unknown>
) => {

  const auditQuery = new QueryBuilder(
    AuditLog.find({ user: userId }), // populate not needed
    query
  )
    .search(["actionType", "details"])
    .filter()
    .sort()
    .paginate()
    .fields();

  //  Data fetch
  const result = await auditQuery.modelQuery;

  // Pagination info
  const pagination = await auditQuery.getPaginationInfo();

  //  Format response
  const formattedData = result.map((log: any) => ({
    _id: log._id,
    actionType: log.actionType,
    details: log.details,
    email: log.email,       
    createdAt: log.createdAt,
    // createdAt: log.createdAt
  }));

  return {
    meta: pagination,
    data: formattedData
  };
};



export const AuditService = {
  createLog,
  getAllLogsExceptMerchant,
  getAllLogsExceptMerchantTier,
  getLogsByUserId
};
