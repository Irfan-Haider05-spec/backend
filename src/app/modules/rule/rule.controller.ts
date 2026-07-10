import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { RuleService } from './rule.service';


//privacy policy
const createPrivacyPolicy = catchAsync(async (req: Request, res: Response) => {
    const { ...privacyData } = req.body
    const data = await RuleService.createPrivacyPolicyToDB(privacyData)
  
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Privacy policy created successfully',
        data: data
    })
})

//privacy policy
const getPrivacyPolicy = catchAsync(async (req: Request, res: Response) => {
    const data = await RuleService.getPrivacyPolicyFromDB()
  
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Privacy policy retrieved successfully',
        data: data
    })
})


//terms and conditions
const createTermsAndCondition = catchAsync( async (req: Request, res: Response) => {
    const { ...termsData } = req.body
    const data = await RuleService.createTermsAndConditionToDB(termsData)
  
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Terms and conditions created successfully',
        data: data
    })
})
  
const getTermsAndCondition = catchAsync(async (req: Request, res: Response) => {
    const data = await RuleService.getTermsAndConditionFromDB()
  
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Terms and conditions retrieved successfully',
        data: data
    })
})

//about
const createAbout = catchAsync(async (req: Request, res: Response) => {
    const { ...aboutData } = req.body
    const data = await RuleService.createAboutToDB(aboutData)
  
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'About created successfully',
        data: data
    })
})
  
const getAbout = catchAsync(async (req: Request, res: Response) => {
    const data = await RuleService.getAboutFromDB()
  
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'About retrieved successfully',
        data: data
    })
})

export const RuleController = {
    createPrivacyPolicy,
    getPrivacyPolicy,
    createTermsAndCondition,
    getTermsAndCondition,
    createAbout,
    getAbout
}  