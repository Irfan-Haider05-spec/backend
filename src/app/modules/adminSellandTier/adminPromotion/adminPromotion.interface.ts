export interface IPromotion {
  _id?: string;
  cardId?: string; // auto-generated random string
  name: string; // Promotion name
  customerSegment: "new_customer" | "returning_customer" | "loyal_customer" | "all_customer"; // Customer segment
  discountPercentage: number; // Discount percentage
  promotionType: "seasonal" | "referral" | "flash_sale" | "loyalty"; // Promotion type
  startDate: Date; // Start date
  endDate: Date; // End date
  availableDays: string[]; // Promotion days, e.g., ["mon", "tue"] or ["all"]
  image?: string; // optional uploaded image
  status?: "active" | "inactive" | "expired"; // Promotion status
  createdBy: string; // user id who created the promotion
}
