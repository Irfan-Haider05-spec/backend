import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { AdminService } from "./admin.service";
import { AdminCustomerService } from "./customer.service";
import { AdminMerchantService } from "./merchant.service";
import { AdminAnalyticsService } from "./analytics.service";
import { JwtPayload } from "jsonwebtoken";

const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const data = await AdminService.createAdminToDB(payload);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Admin created Successfully",
    data: data,
  });
});

const deleteAdmin = catchAsync(async (req: Request, res: Response) => {
  const payload = req.params.id;
  const data = await AdminService.deleteAdminFromDB(payload);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Admin Deleted Successfully",
    data: data,
  });
});

const getAdmin = catchAsync(async (req: Request, res: Response) => {
  const data = await AdminService.getAdminFromDB();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Admin Retrieved Successfully",
    data: data,
  });
});
const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const data = await AdminService.updateUserStatus(
    req.params.id,
    req.body.status
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User status updated Successfully",
    data: data,
  });
});

const getAllCustomers = catchAsync(async (req: Request, res: Response) => {
  const data = await AdminCustomerService.getAllCustomers(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "All customers Retrieved Successfully",
    data: data.allcustomers,
    pagination: data.pagination,
  });
});


//================= customer export ===================//
const exportCustomers = catchAsync(async (req: Request, res: Response) => {
  const buffer = await AdminAnalyticsService.exportCustomers(req.query);

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=customers.xlsx"
  );

  res.send(buffer);
});


// near merchants controller
const getNearbyMerchantsController = catchAsync(
  async (req: Request, res: Response) => {

    const user = req.user as JwtPayload;
    const data = await AdminMerchantService.getNearbyMerchants(req.query, user._id);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Nearby merchants retrieved successfully",
      data: data,

    });

  }
);



const getAllMerchants = catchAsync(async (req: Request, res: Response) => {
  const data = await AdminMerchantService.getAllMerchants(req.query, req.user); 
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "All merchants Retrieved Successfully",
    data: data.allmerchants,
    pagination: data.pagination,
  });
});






const exportMerchants = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as any; // ✅ auth user

  const buffer = await AdminAnalyticsService.exportMerchants(
    req.query,
    user // ✅ pass user
  );

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  res.setHeader(
    "Content-Disposition",
    "attachment; filename=merchants.xlsx"
  );

  res.status(200).send(buffer);
});

// ======== customer crue operations ======== //

//=== singel customer details ===//

const getSingleCustomer = catchAsync(async (req, res) => {
  const data = await AdminCustomerService.getSingleCustomer(req.params.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Customer retrieved successfully",
    data: data,
  });
});

//===== update customer ======//
const updateCustomer = catchAsync(async (req, res) => {
  const id = req.params.id;

  // First extract body
  let bodyData: any = req.body;

  // If form-data contains "data" JSON string → parse to real object
  if (bodyData.data) {
    bodyData = JSON.parse(bodyData.data);
  }

  // Now handle uploaded image
  const files = req.files as
    | { [key: string]: Express.Multer.File[] }
    | undefined;

  if (files?.image?.length) {
    bodyData.profile = files.image[0].path;
  }



  const data = await AdminCustomerService.updateCustomer(id, bodyData);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Customer updated successfully",
    data: data,
  });
});

//===== delete customer ======//
const deleteCustomer = catchAsync(async (req, res) => {
  await AdminCustomerService.deleteCustomer(req.params.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Customer deleted successfully",
    data: null,
  });
});

//===== customer status update ======//
const updateCustomerStatus = catchAsync(async (req, res) => {
  const data = await AdminCustomerService.updateCustomerStatus(
    req.params.id,
    req.body.status
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Customer status updated successfully",
    data: data,
  });
});


//=== singel merchant details ===//
const getSingleMerchant = catchAsync(async (req, res) => {
  const data = await AdminMerchantService.getSingleMerchant(req.params.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Merchant retrieved successfully",
    data: data,
  });
});

//===== update merchant ======//

const updateMerchant = catchAsync(async (req, res) => {
  const id = req.params.id;

  // All JSON data from form-data comes as strings
  // So we need to parse them
  let payload: any = { ...req.body };

  // If data object is string, parse it
  if (payload.data) {
    payload = JSON.parse(payload.data);
  }

  // Handle files
  const files = req.files as
    | { [key: string]: Express.Multer.File[] }
    | undefined;

  if (files?.image && files.image.length > 0) {
    payload.profile = files.image[0].path; // Attach image path to payload
  }

  const data = await AdminMerchantService.updateMerchant(id, payload);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Merchant updated successfully",
    data: data,
  });
});

//===== delete merchant ======//
const deleteMerchant = catchAsync(async (req, res) => {
  await AdminMerchantService.deleteMerchant(req.params.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Merchant deleted successfully",
  });
});

//===== merchant status update ======//

const updateMerchantStatus = catchAsync(async (req, res) => {
  const data = await AdminMerchantService.updateMerchantStatus(
    req.params.id,
    req.body.status
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Merchant status updated successfully",
    data: data,
  });
});


const updateMerchantApproveStatus = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload
  const data = await AdminMerchantService.updateMerchantApproveStatus(
    req.params.id,
    req.body.approveStatus,
    user._id
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Merchant approve status updated successfully",
    data: data,
  });
});



const getCustomerSellDetails = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const data = await AdminCustomerService.getCustomerSellDetails(userId, req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Customer sell list retrieved successfully",
    data: data.data,
    pagination: data.pagination,
  });
});


const getMerchantCustomerStats = catchAsync(async (req: Request, res: Response) => {
  const { merchantId } = req.params;

  const data = await AdminMerchantService.getMerchantCustomerStats(
    merchantId,
    req.query
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Merchant customer stats retrieved successfully",
    data: data.data,
    pagination: data.pagination,
  });
});



export const AdminController = {
  deleteAdmin,
  createAdmin,
  getAdmin,
  updateUserStatus,
  getAllCustomers,
  exportCustomers,
  getAllMerchants,

  getSingleCustomer,
  updateCustomer,
  deleteCustomer,
  updateCustomerStatus,

  getSingleMerchant,
  updateMerchant,
  deleteMerchant,
  updateMerchantStatus,
  updateMerchantApproveStatus,
  exportMerchants,


  getNearbyMerchantsController,

  getCustomerSellDetails,
  getMerchantCustomerStats
};
