// src/middlewares/canAccessMerchantProfile.ts
import { NextFunction, Request, Response } from 'express';
import ApiError from '../../errors/ApiErrors';
import { User } from '../modules/user/user.model';

export const canAccessMerchantProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reqUser = req.user as any;

    // If params userId exists (single profile route)
    const profileUserId = req.params.userId;

    if (profileUserId) {
      const profileUser = await User.findById(profileUserId);
      if (!profileUser) throw new ApiError(404, 'User not found');

      // Admin always access
      if (reqUser.role === 'ADMIN') return next();

      // Root Merchant
      if (reqUser.role === 'MERCHANT' && !reqUser.isSubMerchant) {
        if (profileUser.merchantId?.toString() === reqUser._id.toString()) return next();
      }

      // Staff
      if (reqUser.isSubMerchant) {
        if (reqUser._id.toString() === profileUser._id.toString()) return next(); // own profile
        if (profileUser._id.toString() === reqUser.merchantId?.toString()) return next(); // root merchant profile
      }

      throw new ApiError(403, 'You cannot access this profile');
    }

 

    next(); // allow access
  } catch (err) {
    next(err);
  }
};

