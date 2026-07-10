import { USER_ROLES } from "../../../enums/user";
import { DisclaimerTypes } from "./disclaimer.constants";


export const DISCLAIMER_NOTIFICATION_MAP: Record<
    DisclaimerTypes,
    {
        title: string;
        body: string;
        audience: USER_ROLES.MERCHANT | USER_ROLES.USER;
    }
> = {
    [DisclaimerTypes.CUSTOMER_TERMS_AND_CONDITIONS]: {
        title: 'Customer Terms & Conditions Updated',
        body: 'Customer Terms and Conditions have been updated.',
        audience: USER_ROLES.USER,
    },
    [DisclaimerTypes.CUSTOMER_PRIVACY_POLICY]: {
        title: 'Customer Privacy Policy Updated',
        body: 'Customer Privacy Policy has been updated.',
        audience: USER_ROLES.USER,
    },
    [DisclaimerTypes.MERCHANT_TERMS_AND_CONDITIONS]: {
        title: 'Merchant Terms & Conditions Updated',
        body: 'Merchant Terms and Conditions have been updated.',
        audience: USER_ROLES.MERCHANT,
    },
    [DisclaimerTypes.MERCHANT_PRIVACY_POLICY]: {
        title: 'Merchant Privacy Policy Updated',
        body: 'Merchant Privacy Policy has been updated.',
        audience: USER_ROLES.MERCHANT,
    },
};
