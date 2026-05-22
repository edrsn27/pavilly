import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/shared/utils/supabase";
import { productsQueryKey } from "./useProducts";

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
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, store_id, ...patch }: UpdateProductParams) => {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("products")
        .update(patch)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { ...data, store_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: productsQueryKey(data.store_id) });
    },
  });
};
