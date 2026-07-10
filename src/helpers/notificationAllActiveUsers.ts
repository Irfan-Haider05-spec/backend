import { NotificationType } from "../app/modules/notification/notification.model";
import { User } from "../app/modules/user/user.model";
import { USER_ROLES, USER_STATUS } from "../enums/user";
import { sendNotification } from "./notificationsHelper";


export const notifyAllActiveUsers = async ({
    title,
    body,
    type,
    metadata,
    audience
}: {
    title: string;
    body: string;
    type: NotificationType;
    metadata?: Record<string, any>;
    audience?: USER_ROLES.MERCHANT | USER_ROLES.USER;
}) => {
    const users = await User.find({ role: audience === USER_ROLES.USER ? USER_ROLES.USER : USER_ROLES.MERCHANT, status: USER_STATUS.ACTIVE }).select('_id');

    await sendNotification({
        userIds: users.map((u) => u._id),
        title,
        body,
        type,
        metadata,
    });
};
