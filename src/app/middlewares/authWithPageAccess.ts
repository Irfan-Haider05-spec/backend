// import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';
// import ApiError from '../../errors/ApiErrors';
// import { StatusCodes } from 'http-status-codes';
// import { USER_ROLES } from '../../enums/user';
// import config from '../../config';
// import { User } from '../modules/user/user.model';

// // Custom type for JWT payload
// interface IJwtPayload {
//   id: string;
//   role: string;
//   email: string;
//   iat?: number;
//   exp?: number;
// }

// export const authWithPageAccess = (page: string) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       // 1. Get token directly from header
//       const token = (req.headers.authorization || '').replace(/^Bearer\s/, '');
//       if (!token) {
//         return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Not authenticated'));
//       }

//       // 2. Verify token
//       const decoded = jwt.verify(token, config.jwt.jwt_secret as string) as IJwtPayload;

//       if (!decoded.role) {
//         return next(new ApiError(StatusCodes.FORBIDDEN, 'Role not found in token'));
//       }

//       req.user = {
//         _id: decoded.id,
//         role: decoded.role,
//         email: decoded.email,
//       };

//       // 3. Role check
//       if ([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].includes(decoded.role as USER_ROLES)) {
//         return next();
//       }

//       // 4. Page access check
//       const user = await User.findById(decoded.id).select('pages');
//       if (user?.pages?.includes(page)) {
//         req.user.pages = user.pages;
//         return next();
//       }

//       return next(new ApiError(StatusCodes.FORBIDDEN, 'Access denied'));
//     } catch (error) {
//       return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid token'));
//     }
//   };
// };
