import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { ContactService } from "./contactUs.service";


const createContact = catchAsync(async (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body;

  const data = await ContactService.createContact({
    name,
    email,
    subject,
    message,
  });

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Contact message submitted successfully",
    data: data,
  });
});

const getAllContacts = catchAsync(async (req: Request, res: Response) => {
  const result = await ContactService.getAllContacts(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'All contact messages fetched successfully',
    data: result.data,
    pagination: result.pagination,
  });
});

export const ContactController = {
  createContact,
  getAllContacts,
};
