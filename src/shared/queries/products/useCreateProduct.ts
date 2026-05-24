import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/shared/utils/supabase";
import { productsQueryKey } from "./useProducts";
import { inventoryQueryKey } from "@/shared/queries/inventory";

export interface CreateProductParams {
  store_id: string;
  name: string;
  description?: string;
  barcode?: string;
  category_id?: string;
  price_type: "fixed" | "variable";
  cost_price?: number;
  selling_price?: number;
  is_active: boolean;
  initialStock?: number;
}

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ initialStock, ...params }: CreateProductParams) => {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("products")
        .insert(params)
        .select()
        .single();

      if (error) throw error;

      if (params.price_type === "fixed" && initialStock && initialStock > 0) {
        await supabase
          .from("inventory")
          .update({ stock: initialStock })
          .eq("product_id", data.id);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: productsQueryKey(data.store_id) });
      queryClient.invalidateQueries({ queryKey: inventoryQueryKey(data.store_id) });
    },
  });
};
