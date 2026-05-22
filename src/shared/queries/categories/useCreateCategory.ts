import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/shared/utils/supabase";
import { categoriesQueryKey } from "./useCategories";

export interface CreateCategoryParams {
  storeId: string;
  name: string;
  sort_order: number;
}

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: CreateCategoryParams) => {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("categories")
        .insert({ store_id: params.storeId, name: params.name, sort_order: params.sort_order })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: categoriesQueryKey(variables.storeId) });
    },
  });
};
