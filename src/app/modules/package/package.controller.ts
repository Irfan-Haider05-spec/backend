import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { PackageService } from "./package.service";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";

const createPackage = catchAsync(async (req: Request, res: Response) => {
    const { title, description, price, duration, paymentType, features, credit, loginLimit } = req.body;

    if(!title || !features?.length) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Title and features are required");
    }

    const payload: Partial<any> = {
        title,
        description,
        price: Number(price),
        duration,
        paymentType,
        features,
        credit: Number(credit),
        loginLimit: Number(loginLimit),
        admin: (req.user as any)?._id
    };

    const data = await PackageService.createPackageToDB(payload);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Package created Successfully",
        data: data
    });
});

const updatePackage = catchAsync(async(req: Request, res: Response) => {
    const data = await PackageService.updatePackageToDB(req.params.id, req.body);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Package updated Successfully",
        data: data
    });
});

const getPackage = catchAsync(async(req: Request, res: Response) => {
    const data = await PackageService.getPackageFromDB(req.query.paymentType as string);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Packages retrieved Successfully",
        data: data
    });
});

const getSinglePackage = catchAsync(async (req: Request, res: Response) => {
    const packageId = req.params.id;
    const data = await PackageService.getSinglePackageFromDB(packageId);

    if (!data) {
        return sendResponse(res, {
            statusCode: StatusCodes.NOT_FOUND,
            success: false,
            message: "Package not found",
        });
    }

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Package retrieved successfully",
        data: data,
    });
});


const packageDetails = catchAsync(async(req: Request, res: Response) => {
    const data = await PackageService.getPackageDetailsFromDB(req.params.id);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Package Details retrieved Successfully",
        data: data
    });
});

const deletePackage = catchAsync(async(req: Request, res: Response) => {
    const data = await PackageService.deletePackageToDB(req.params.id);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Package deleted Successfully",
        data: data
    });
});


const togglePackageStatus = catchAsync(async(req: Request, res: Response) => {
    const data = await PackageService.togglePackageStatusInDB(req.params.id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Package status toggled Successfully",
        data: data
    });
});

const getActivePackages = catchAsync(async (req: Request, res: Response) => {
    const data = await PackageService.getActivePackagesFromDB();
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Active packages retrieved Successfully",
        data: data
    });
});

export const PackageController = {
    createPackage,
    updatePackage,
    getPackage,
    getSinglePackage,
    packageDetails,
    deletePackage,
    togglePackageStatus,
    getActivePackages
};
