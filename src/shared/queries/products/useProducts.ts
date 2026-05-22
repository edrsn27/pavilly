import { useQuery } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/shared/utils/supabase";

export interface Product {
  id: string;
  store_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price_type: "fixed" | "variable";
  cost_price: number | null;
  selling_price: number | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  inventory: { stock: number; low_stock_threshold: number } | null;
}

export const productsQueryKey = (storeId: string) =>
  ["products", { storeId }] as const;

export const useProducts = (storeId: string) =>
  useQuery({
    queryKey: productsQueryKey(storeId),
    queryFn: async (): Promise<Product[]> => {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("products")
        .select(
          "id, store_id, category_id, name, description, price_type, cost_price, selling_price, image_url, is_active, created_at, inventory(stock, low_stock_threshold)"
        )
        .eq("store_id", storeId)
        .order("created_at", { ascending: false });

      if (error) return [];
      return (data ?? []).map((p) => ({
        ...p,
        inventory: Array.isArray(p.inventory) ? (p.inventory[0] ?? null) : p.inventory,
      })) as Product[];
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
