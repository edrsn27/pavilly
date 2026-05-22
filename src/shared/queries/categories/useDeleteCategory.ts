import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/shared/utils/supabase";
import { categoriesQueryKey } from "./useCategories";

export interface DeleteCategoryParams {
  id: string;
  storeId: string;
}

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: DeleteCategoryParams) => {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", params.id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: categoriesQueryKey(variables.storeId) });
    },
  });
};
