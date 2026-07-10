import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { UserService } from "./userManagement.service";
import { AuditService } from "../auditLog/audit.service";

import ApiError from "../../../errors/ApiErrors";


// create user
const createUser = catchAsync(async (req: any, res: any) => {
  const creator = req.user; // logged-in merchant or admin


  const data = await UserService.createUserToDB(req.body, creator);

  await AuditService.createLog(
    creator.email,
    "CREATE_USER",
    `User created: ${data.email} by ${creator.email}`
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "User created successfully",
    data: data,
  });
});



const createMerchant = catchAsync(async (req: any, res: any) => {
  const creator = req.user; // logged-in user creating the merchant
  const data = await UserService.createMerchantToDB(req.body, creator);

  // Audit log
  await AuditService.createLog(
    req.user?.email || "Unknown",
    "CREATE_MERCHANT",
    `Created merchant: ${data.email}, business: ${data.businessName}`
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "Merchant created successfully",
    data: data,
  });
});



// get all users
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const requestingUserRole = (req.user as any)?.role || "ADMIN";

  // pass query params
  const data = await UserService.getAllUsersFromDB(requestingUserRole, req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Users retrieved successfully",
    data: data,
  });
});


// get single user
const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const data = await UserService.getSingleUserFromDB(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "User retrieved successfully",
    data: data,
  });
});

// update user
const updateUser = catchAsync(async (req: any, res: Response) => {
  const data = await UserService.updateUserToDB(req.params.id, req.body);

  if (!data) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }
  // Audit log
  await AuditService.createLog(
    req.user?.email || "Unknown", // যিনি update করেছে
    "UPDATE_USER",
    `Updated user: ${data.email}`
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "User updated successfully",
    data: data,
  });
});


// delete user
const deleteUser = catchAsync(async (req: any, res: any) => {
  const data = await UserService.deleteUserFromDB(req.params.id);

  // Audit log
  await AuditService.createLog(
    req.user?.email || "Unknown",
    "DELETE_USER",
    `Deleted user: ${req.params.id}`
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "User deleted successfully",
    data: data,
  });
});


// toggle user status
const toggleUserStatus = catchAsync(async (req: any, res: any) => {
  const data = await UserService.toggleUserStatusFromDB(req.params.id);

  // Audit log
  await AuditService.createLog(
    req.user?.email || "Unknown", // action নেয়া user
    "TOGGLE_USER_STATUS",
    `Toggled status for user: ${data.email}, new status: ${data.status}`
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "User status updated successfully",
    data: data,
  });
});


const getAllMerchants = catchAsync(async (req, res) => {
  const data = await UserService.getAllMerchants(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "All merchants retrieved successfully",
    data: data.allmerchants,
    pagination: data.pagination,
  });
});

const getSingleMerchant = catchAsync(async (req, res) => {
  const data = await UserService.getSingleMerchant(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Merchant retrieved successfully",
    data: data,
  });
});

const updateMerchant = catchAsync(async (req, res) => {
  const data = await UserService.updateMerchant(
    req.params.id,
    req.body
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Merchant updated successfully",
    data: data,
  });
});

const deleteMerchant = catchAsync(async (req, res) => {
  await UserService.deleteMerchant(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Merchant deleted successfully",
  });
});

const toggleMerchantStatus = catchAsync(async (req, res) => {
  const data = await UserService.toggleMerchantStatus(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Merchant status updated successfully",
    data: data,
  });
});





export const UserController = {
  createUser,
  createMerchant,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
   getAllMerchants,
  getSingleMerchant,
  updateMerchant,
  deleteMerchant,
  toggleMerchantStatus,
};
