import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { TierService } from "./tier.service";
import { createTierSchema, updateTierSchema } from "./tier.validation";
import { ITier } from "./tier.interface";

import catchAsync from "../../../../shared/catchAsync";
import sendResponse from "../../../../shared/sendResponse";
import ApiError from "../../../../errors/ApiErrors";
import { AuditService } from "../../auditLog/audit.service";
import { sendNotification,  } from "../../../../helpers/notificationsHelper";
import { NotificationType } from "../../notification/notification.model";





const createTier = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as any;


  // ✅ Decide which ID to use
  const filterId = user.isSubMerchant ? user.merchantId : user._id;


  // -----------------------------
  // 1️⃣ Validate Body
  // -----------------------------
  const validatedBody = await createTierSchema.parseAsync({
    ...req.body,
    pointsThreshold: Number(req.body.pointsThreshold),
    minTotalSpend: Number(req.body.minTotalSpend),
    isActive:
      req.body.isActive !== undefined
        ? Boolean(req.body.isActive)
        : undefined,
  });



 // -----------------------------
  // Allowed Tier Names
  // -----------------------------
  const ALLOWED_TIERS = [
    "Gold Basic",
    "Gold Plus",
    "Platinum",
    "Platinum Plus",
    "Diamond",
  ];

  // ❌ Invalid Tier Name
  if (!ALLOWED_TIERS.includes(validatedBody.name)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Invalid tier name. Allowed tiers: Gold Basic, Gold Plus, Platinum, Platinum Plus, Diamond"
    );
  }

  // -----------------------------
  // Prevent Duplicate Tier Name
  // -----------------------------
  const existingTier = await TierService.checkExistingTier(
    filterId,
    validatedBody.name
  );

  if (existingTier) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Tier "${validatedBody.name}" already exists for this merchant`
    );
  }

  // 🔥 Gold Basic validation
  if (validatedBody.name === "Gold Basic") {
    if (validatedBody.pointsThreshold !== 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Gold Basic tier must have pointsThreshold = 0"
      );
    }

  
  }


  const payload: Partial<ITier> = {
    ...validatedBody,
    admin: filterId,
    isActive: validatedBody.isActive ?? true,
  };


  // -----------------------------
  // 2️⃣ Save Tier to DB
  // -----------------------------
  const data = await TierService.createTierToDB(payload);


  // -----------------------------
  // 3️⃣ Audit Log
  // -----------------------------
  await AuditService.createLog(
    user._id,
    "CREATE_TIER",
    `Tier "${data.name}" created`
  );


  // -----------------------------
  // 4️⃣ Send Notifications to Merchant's Customers (Sell model)
  // -----------------------------
  const { fullUser, customerSocketIds } =
    await TierService.getMerchantAndCustomersForNotification(filterId);

  if (customerSocketIds?.length) {
    await sendNotification({
      userIds: customerSocketIds,
      title: "New Tier Available!",
      body: `Merchant ${fullUser?.businessName} has created a new tier: "${data.name}". Check it out now!`,
      type: NotificationType.MANUAL,
      channel: { socket: true, push: true },
    });
  
  } else {
    
  }

  // -----------------------------
  // 5️⃣ Send Response
  // -----------------------------
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Tier created successfully",
    data: data,
  });
 
});

const updateTier = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as any;


  // -----------------------------
  // 1️⃣ Parse and Validate Body
  // -----------------------------
  const body = req.body.data ? JSON.parse(req.body.data) : req.body;
  const validatedBody = await updateTierSchema.parseAsync(body);


  // 🔥 Gold Basic validation (UPDATE)
  if (
    validatedBody.name === "Gold Basic" &&
    (
      (validatedBody.pointsThreshold !== undefined && validatedBody.pointsThreshold !== 0)
    )
  ) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Gold Basic must have pointsThreshold = 0 and reward = 0"
    );
  }

  // -----------------------------
  // 2️⃣ Prepare Payload with reward logic
  // -----------------------------
  const payload: any = {
    ...(validatedBody.name && { name: validatedBody.name }),
    ...(validatedBody.pointsThreshold !== undefined && { pointsThreshold: Number(validatedBody.pointsThreshold) }),
  };

  

  if (validatedBody.accumulationRule) payload.accumulationRule = validatedBody.accumulationRule;
  if (validatedBody.redemptionRule) payload.redemptionRule = validatedBody.redemptionRule;
  if (validatedBody.minTotalSpend !== undefined) payload.minTotalSpend = Number(validatedBody.minTotalSpend);
  if (validatedBody.isActive !== undefined) payload.isActive = Boolean(validatedBody.isActive);



  // -----------------------------
  // 3️⃣ Update Tier in DB
  // -----------------------------
  const data = await TierService.updateTierToDB(req.params.id, payload);
  if (!data) throw new ApiError(StatusCodes.NOT_FOUND, "Tier not found");


  // -----------------------------
  // 4️⃣ Audit Log
  // -----------------------------
  await AuditService.createLog(
    user._id,
    "UPDATE_TIER",
    `Tier "${data.name}" updated`
  );


  // -----------------------------
  // 5️⃣ Send Notifications to Merchant's Customers
  // -----------------------------
  const filterId = user.isSubMerchant ? user.merchantId : user._id;

  const { fullUser, customerSocketIds } =
    await TierService.getMerchantAndCustomersForNotification(filterId);

  if (customerSocketIds?.length) {
    await sendNotification({
      userIds: customerSocketIds,
      title: "Tier Updated!",
      body: `Merchant ${fullUser?.businessName} has updated a tier: "${data.name}". Check it out now!`,
      type: NotificationType.MANUAL,
      channel: { socket: true, push: true },
    });

    
  } else {
    
  }

  // -----------------------------
  // 6️⃣ Send Response
  // -----------------------------
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Tier updated successfully",
    data: data,
  });
  
});

const getTier = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as any;


  const filterId = user.isSubMerchant ? user.merchantId : user._id;

  const { data, pagination } = await TierService.getTiersFromDB(req.query, filterId);

  // Send response
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Tiers retrieved successfully",
    data: data,
    pagination,
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

    // ✅ Audit Log creation
  await AuditService.createLog(
    (req.user as any)?._id,           // userId
    "DELETE_TIER",                    // actionType
    `Tier "${data.name}" deleted`    // details
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Tier deleted successfully",
    data: data,
  });
});


const getTierByUserId = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const { data, pagination } = await TierService.getTiersFromDB(req.query, userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User tiers retrieved successfully",
    data: data,
    pagination,
  });
});


export const TierController = {
  createTier,
  updateTier,
  getTier,
  getSingleTier,
  deleteTier,
  getTierByUserId
};
