import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../../shared/catchAsync";
import sendResponse from "../../../../shared/sendResponse";
import { MemberService } from "./merchantCustomerList.service";


const getAllMembers = catchAsync(async (req, res) => {
  const merchantId = (req.user as any)?._id;

  const data = await MemberService.getAllMembers(merchantId, req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All members fetched successfully",
    data: data.members,
    // pagination: data.pagination,
  });
});

const getSingleMember = catchAsync(async (req, res) => {
  const merchantId = (req.user as any)?._id;
  const userId = req.params.userId;

  const data = await MemberService.getSingleMember(merchantId, userId);

  if (!data) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Member not found",
    });
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Member fetched successfully",
    data: data,
  });
});

const getSingleMemberTier = catchAsync(async (req, res) => {
  const merchantId = (req.user as any)?._id;
  const userId = req.params.id;

  const data = await MemberService.getSingleMemberTier(merchantId, userId);

  if (!data) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Member not found",
    });
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Member fetched successfully",
    data: data,
  });
});
export const MemberController = {
  getAllMembers,
  getSingleMember,
  getSingleMemberTier,
};
