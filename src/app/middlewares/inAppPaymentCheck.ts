// src/util/iapVerifier.ts
import axios from "axios";
import { google } from "googleapis";

export const verifyIosReceipt = async (receipt: string): Promise<boolean> => {
  try {
    const response = await axios.post("https://buy.itunes.apple.com/verifyReceipt", {
      'receipt-data': receipt,
      'password': process.env.IOS_SHARED_SECRET,
    });
    return response.data.status === 0; // 0 means valid
  } catch {
    return false;
  }
};

// Android Google Play Verification
export const verifyAndroidReceipt = async (
  packageName: string,
  productId: string,
  purchaseToken: string
): Promise<boolean> => {
  try {
    // Service Account Key
    const keyFile = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY || "./GOOGLE_PLAY_SERVICE_ACCOUNT_KEY.json";
    const auth = new google.auth.GoogleAuth({
      keyFile,
      scopes: ["https://www.googleapis.com/auth/androidpublisher"],
    });

    const androidPublisher = google.androidpublisher({
      version: "v3",
      auth,
    });

    // Verify purchase
    const res = await androidPublisher.purchases.products.get({
      packageName,
      productId,
      token: purchaseToken,
    });

    // purchaseState = 0 means purchased
    return res.data.purchaseState === 0;
  } catch {

    return false;
  }
};
