export enum USER_ROLES {
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
  USER = "USER",
  MERCHANT = "MERCHANT",
  ADMIN_REP = "ADMIN_REP",
  ADMIN_SELL = "ADMIN_SELL",
  VIEW_MERCHANT = "VIEW_MERCHANT",
  ADMIN_MERCHANT = "ADMIN_MERCHANT",
  VIEW_ADMIN = "VIEW_ADMIN",
}

export enum USER_STATUS {
  ACTIVE = "active",
  INACTIVE = "inActive",
  BLOCK = "block",
  ARCHIVE = "archive",
  SUSPENDED = "suspended",
}

export enum USER_REPORT {
  REPORT = "report",
  NO_REPORT = "no_report",
}

export enum APPROVE_STATUS {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}
export enum SUBSCRIPTION_STATUS {
  ACTIVE = "active",
  INACTIVE = "inActive",
}

// export enum CUSTOMER_SEGMENT {
//   NEW = "new",
//   RETURNING = "returning",
//   LOYAL = "loyal",
//   VIP = "vip",
//   ALL = "all",
// }
export enum CUSTOMER_SEGMENT {
  NEW_CUSTOMER = "new_customer",
  RETURNING_CUSTOMER = "returning_customer",
  LOYAL_CUSTOMER = "loyal_customer",
  VIP_CUSTOMER = "vip_customer",
  ALL_CUSTOMER = "all_customer",
}