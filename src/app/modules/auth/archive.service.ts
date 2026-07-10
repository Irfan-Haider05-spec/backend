import { User } from '../user/user.model';
import ApiError from '../../../errors/ApiErrors';
import { StatusCodes } from 'http-status-codes';
import { USER_STATUS } from '../../../enums/user';

/**
 * Archive a user account.
 * Moves the user status to ARCHIVE without deleting the record.
 */
export const archiveUserInDB = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  user.status = USER_STATUS.ARCHIVE;
  await user.save();
  return user;
};
