import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";



import { TierService } from "./tierAdmin.service";
import { createTierSchema, updateTierSchema } from "./tierAdmin.validation";
import { ITier } from "./tierAdmin.interface";

import catchAsync from "../../../../shared/catchAsync";
import sendResponse from "../../../../shared/sendResponse";
import ApiError from "../../../../errors/ApiErrors";
import { AuditService } from "../../auditLog/audit.service";

const createTier = catchAsync(async (req: Request, res: Response) => {
  const validatedBody = await createTierSchema.parseAsync({
    ...req.body,
    reward: Number(req.body.reward),
    pointsThreshold: Number(req.body.pointsThreshold),
    minTotalSpend: Number(req.body.minTotalSpend),
    isActive: req.body.isActive !== undefined ? Boolean(req.body.isActive) : undefined,
  });

  const payload: Partial<ITier> = {
    ...validatedBody,
    admin: (req.user as any)?._id,
    isActive: validatedBody.isActive ?? true,
  };

  const data = await TierService.createTierToDB(payload);

  // -----------------------------
  // 3️⃣ Audit Log
  // -----------------------------
  await AuditService.createLog(
    (req.user as any)?._id,
    "CREATE_TIER",
    `Tier "${data.name}" created`
  );


  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Tier created successfully",
    data: data,
  });
});

const updateTier = catchAsync(async (req: Request, res: Response) => {
  const body = req.body.data ? JSON.parse(req.body.data) : req.body;
  const validatedBody = await updateTierSchema.parseAsync(body);

  const payload: any = {
    ...(validatedBody.name && { name: validatedBody.name }),
    ...(validatedBody.pointsThreshold !== undefined && { pointsThreshold: Number(validatedBody.pointsThreshold) }),
    ...(validatedBody.accumulationRule && { accumulationRule: validatedBody.accumulationRule }),
    ...(validatedBody.redemptionRule && { redemptionRule: validatedBody.redemptionRule }),
    ...(validatedBody.minTotalSpend !== undefined && { minTotalSpend: Number(validatedBody.minTotalSpend) }),
    ...(validatedBody.isActive !== undefined && { isActive: Boolean(validatedBody.isActive) }),
  };

  const data = await TierService.updateTierToDB(req.params.id, payload);
  if (!data) throw new ApiError(StatusCodes.NOT_FOUND, "Tier not found");

   await AuditService.createLog(
    (req.user as any)?._id,
    "UPDATE_TIER",
    `Tier "${data.name}" updated`
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Tier updated successfully",
    data: data,
  });
});

const getTier = catchAsync(async (req: Request, res: Response) => {
  const adminId = (req.user as any)?._id;
  const data = await TierService.getAllTiersFromDB(req.query, adminId);

  // Send response
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Tiers retrieved successfully",
    data: data.data,
    pagination: data.pagination,
  });
});

const getSingleTier = catchAsync(async (req: Request, res: Response) => {
  const data = await TierService.getSingleTierFromDB(req.params.id);
  if (!data) throw new ApiError(StatusCodes.NOT_FOUND, "Tier not found");

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Tier retrieved successfully",
    data: data,
  });
});

const deleteTier = catchAsync(async (req: Request, res: Response) => {
  const data = await TierService.deleteTierToDB(req.params.id);
  if (!data) throw new ApiError(StatusCodes.NOT_FOUND, "Tier not found");

    // -----------------------------
  // 1️⃣ Audit Log
  // -----------------------------
  await AuditService.createLog(
    (req.user as any)?._id,
    "DELETE_TIER",
    `Tier "${data.name}" deleted`
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Tier deleted successfully",
    data: data,
  });
});

export const TierController = {
  createTier,
  updateTier,
  getTier,
  getSingleTier,
  deleteTier,
};
