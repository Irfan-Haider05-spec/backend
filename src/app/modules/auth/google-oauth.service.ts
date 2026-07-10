import { OAuth2Client } from 'google-auth-library';
import { User } from '../user/user.model';


import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiErrors';
import { jwtHelper } from '../../../helpers/jwtHelper';

import { generateCustomUserId } from '../user/user.utils';
import { createUniqueReferralId } from '../../../utils/generateReferralId';
import { USER_ROLES } from '../../../enums/user';
import config from '../../../config';

const googleClient = new OAuth2Client(config.social.google_client_id);

export const googleLoginToDB = async (idToken: string, role: string) => {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: config.social.google_client_id,
  });
  const payload = ticket.getPayload();

  if (!payload?.email || !payload.email_verified) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid or unverified Google account');
  }
  const email = payload.email.toLowerCase();
  const googleId = payload.sub;
  let isFirstLogin = false;
  let user = await User.findOne({ email });

  if (user?.googleId && user.googleId !== googleId) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Google account mismatch');
  }

  if (!user) {
    const [referenceId, customUserId] = await Promise.all([
      createUniqueReferralId(),
      generateCustomUserId(role === USER_ROLES.MERCHANT ? USER_ROLES.MERCHANT : USER_ROLES.USER),
    ]);
    user = await User.create({
      referenceId,
      customUserId,
      email,
      firstName: payload.name,
      profile: payload.picture ?? null,
      googleId,
      authProviders: ['google'],
      verified: true,
      role: role === USER_ROLES.MERCHANT ? USER_ROLES.MERCHANT : USER_ROLES.USER,
    });
    isFirstLogin = true;
  } else if (!user.googleId) {
    if (user.authProviders.includes('local')) {
      throw new ApiError(StatusCodes.CONFLICT, 'Account exists. Login with password to link Google.');
    }
    user.googleId = googleId;
    user.authProviders.push('google');
    await user.save();
  }

  const accessToken = jwtHelper.createToken(
    { id: user._id, role: user.role, email: user.email },
    config.jwt.jwt_secret as any,
    config.jwt.jwt_expire_in as string,
  );

  return { accessToken, subscription: user.subscription, isFirstLogin };
};
