// services/twilioService.ts
import twilio from "twilio";
import config from "../config";

const client = twilio(config.twilio.accountSid, config.twilio.authToken);

// OTP Generate Function
export const sendOtp = async (phone: string, otp: string) => {
  try {
    const message = await client.messages.create({
      body: `Your verification code is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });
    return message.sid;
  } catch (error) {
    throw new Error("Failed to send OTP");
  }
};
