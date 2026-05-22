import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/shared/utils/supabase";
import { productsQueryKey } from "./useProducts";

export interface CreateProductParams {
  store_id: string;
  name: string;
  description?: string;
  category_id?: string;
  price_type: "fixed" | "variable";
  cost_price?: number;
  selling_price?: number;
  is_active: boolean;
}

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateProductParams) => {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("products")
        .insert(params)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: productsQueryKey(data.store_id) });
    },
  });
};
