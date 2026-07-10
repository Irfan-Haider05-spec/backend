// src/modules/role/role.controller.ts
import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { RoleService } from "./role.service";

export const RoleController = {
  createRole: catchAsync(async (req: Request, res: Response) => {
    const data = await RoleService.createRole(req.body);
    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "Role created successfully",
      data: data,
    });
  }),

  getRoles: catchAsync(async (_req: Request, res: Response) => {
    const data = await RoleService.getRoles();
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Roles fetched successfully",
      data: data,
    });
  }),
};
