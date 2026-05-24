export interface ProductFormValues {
  name: string;
  description: string;
  barcode: string;
  category_id: string;
  price_type: "fixed" | "variable";
  cost_price: string;
  selling_price: string;
  stock: string;
  is_active: boolean;
}
