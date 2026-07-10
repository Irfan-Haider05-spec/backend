import { Response } from "express";

import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { UserService } from "./merchantUserManagement.service";

// ---------------- Create User ----------------
 const createUser = catchAsync(async (req: any, res: Response) => {
  const data = await UserService.createUserToDB(
    req.body,
    req.user
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "User created successfully",
    data: data,
  });
});


// ---------------- Get Merchant's Own Users ----------------
const getMyUsers = catchAsync(async (req: any, res: Response) => {
  const data = await UserService.getUsersByMerchant(
    req.user,
    req.query
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Users fetched successfully",
    data: data,
  });
});


// ---------------- Get Single User ----------------
const getSingleUser = catchAsync(async (req: any, res: Response) => {
  const data = await UserService.getSingleUser(req.params.id, req.user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "User fetched successfully",
    data: data,
  });
});


// ---------------- Update User ----------------
const updateUser = catchAsync(async (req: any, res: Response) => {
  const data = await UserService.updateUser(req.params.id, req.body, req.user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "User updated successfully",
    data: data,
  });
});


// ---------------- Delete User ----------------
const deleteUser = catchAsync(async (req: any, res: Response) => {


  await UserService.deleteUser(req.params.id, req.user);


  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "User deleted successfully",
  });


});



// ---------------- Toggle Status ----------------
 const toggleUserStatus = catchAsync(async (req: any, res: Response) => {
  const data = await UserService.toggleUserStatus(req.params.id, req.user);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "User status updated successfully",
    data: data,
  });
});


export const MerchantUserManagementController = {
    createUser,
    getMyUsers,
    getSingleUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
};
