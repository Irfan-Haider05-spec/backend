export interface ICreatePush {
  title: string;
  body: string;
  state: string; // state to send notification
  adminId?: string; // logged-in admin ID (optional, internally set)
}

export interface IPushResponse {
  success: boolean;
  sentCount: number;
  failedCount: number;
}



export interface IPushPayload {
  sendType: "ALL" | "MERCHANT" | "USER";
  title: string;
  body: string;
  country?: string;
  tier?: string;
  subscriptionType?: string;
  status?: string;
  city?: string; 
  mediaUrl?: string; 
}