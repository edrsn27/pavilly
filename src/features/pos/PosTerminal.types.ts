export interface CartItem {
  productId: string;
  productName: string;
  priceType: "fixed" | "variable";
  unitPrice: number;
  costPrice: number | null;
  quantity: number;
}

export type PaymentMethod = "cash" | "gcash" | "maya" | "card";
