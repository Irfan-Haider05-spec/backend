export interface IPackage {
  // id: string;
  title: string;
  description: string;
  price: number;
  duration:  "1 month" | "1 year" | "4 months" | "8 months";
  priceId?: string; // Stripe price ID
  productId?: string; // Stripe product ID
  isActive?: boolean;
}