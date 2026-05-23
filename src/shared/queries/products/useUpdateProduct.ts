import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/shared/utils/supabase";
import { productsQueryKey } from "./useProducts";
import { inventoryQueryKey } from "@/shared/queries/inventory";

export interface UpdateProductParams {
  id: string;
  store_id: string;
  name: string;
  description?: string;
  category_id?: string | null;
  price_type: "fixed" | "variable";
  cost_price?: number | null;
  selling_price?: number | null;
  is_active: boolean;
  stock?: number;
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, store_id, stock, ...patch }: UpdateProductParams) => {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("products")
        .update(patch)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      if (patch.price_type === "fixed" && stock != null) {
        await supabase
          .from("inventory")
          .update({ stock })
          .eq("product_id", id);
      }

      return { ...data, store_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: productsQueryKey(data.store_id) });
      queryClient.invalidateQueries({ queryKey: inventoryQueryKey(data.store_id) });
    },
  });
};
