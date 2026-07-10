import { ICreateAccount, IResetPassword } from '../types/emailTemplate';

const createAccount = (values: ICreateAccount) => {
    const data = {
        to: values.email,
        subject: 'Verify your account',
        html: `
            <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
                <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
    
                    <!-- Logo -->
                    <img src="https://i.ibb.co.com/YTZ9N8ZW/Card-1-1.png" alt="Aura Logo" style="display: block; margin: 0 auto 20px; width:150px" />

                    <!-- Greeting -->
                    <h2 style="color: #D0A933; font-size: 24px; margin-bottom: 20px;">Hey, ${values.name}!</h2>

                    <!-- Verification Instructions -->
                    <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Thank you for signing up for Aura. Please verify your email address to activate your account.</p>

                    <!-- OTP Section -->
                    <div style="text-align: center;">
                        <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use code is:</p>
                        <div style="background-color: #D0A933; width: 120px; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">${values.otp}</div>
                        <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 3 minutes.</p>
                    </div>

                    <!-- Footer -->
                    <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">If you did not sign up for Aura, please ignore this email.</p>
                    <p style="color: #999; font-size: 12px; text-align: center;">&copy; 2025 Aura. All rights reserved.</p>

                </div>
            </body>
        `
    }

    return data;
}


const resetPassword = (values: IResetPassword) => {
    const data = {
        to: values.email,
        subject: 'Reset your password',
        html: `
            <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
                <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                    // <img src="https://ibb.co.com/rGWK4y0f" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
                    <div style="text-align: center;">
                        <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use code is:</p>
                        <div style="background-color: #277E16; width: 120px; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">${values.otp}</div>
                        <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 3 minutes.</p>
                    </div>
                </div>
            </body>
        `,
    };
    return data;
};


const createAccountNotification = (values: {
  email: string;
  name: string;
  password: string;
}) => {
  return {
    to: values.email,
    subject: "Your Account Has Been Created",
    html: `
      <body style="font-family: Arial; background:#f9f9f9; padding:20px;">
        <div style="max-width:600px;margin:auto;background:#fff;padding:20px;border-radius:10px;">
          
          <h2 style="color:#277E16;">Welcome ${values.name} 🎉</h2>

          <p>Your account has been successfully created.</p>

          <h3>Login Details:</h3>

          <p><b>Email:</b> ${values.email}</p>
          <p><b>Password:</b> ${values.password}</p>

          <p style="margin-top:20px;color:#888;">
            Please change your password after first login for security.
          </p>

        </div>
      </body>
    `,
  };
};

export const emailTemplate = {
    createAccount,
    resetPassword,
    createAccountNotification,
};