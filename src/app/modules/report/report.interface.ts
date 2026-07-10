import mongoose, { Types  } from "mongoose";

export enum REPORT_STATUS {
  PENDING = "PENDING",
  RESOLVED = "RESOLVED",
  CANCELED = "CANCELED",
}



export interface IReport {
  reporter: Types.ObjectId;
  reportedUser: Types.ObjectId;
  reason: string;
  warning?: string;
  status: REPORT_STATUS;
  adminActionBy?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReportModel extends mongoose.Model<IReport> {
  isExistReport(reporterId: string, reportedUserId: string): Promise<IReport | null>;
}
