import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/shared/utils/supabase";
import { categoriesQueryKey } from "./useCategories";

export interface UpdateCategoryParams {
  id: string;
  storeId: string;
  name: string;
  sort_order: number;
}

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: UpdateCategoryParams) => {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("categories")
        .update({ name: params.name, sort_order: params.sort_order })
        .eq("id", params.id)
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
