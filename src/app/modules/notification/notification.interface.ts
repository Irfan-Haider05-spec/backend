import { Model, Types } from "mongoose";
import { NotificationType } from "./notification.model";

export interface INotification {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  body: string;
  type: NotificationType;
  isRead: boolean;
  attachments?: string[];
  channel?: {
    socket?: boolean;
    push?: boolean;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export type NotificationModel = Model<INotification>;
