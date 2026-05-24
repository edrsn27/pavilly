import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/shared/utils/supabase";

export interface DeleteGcashAccountParams {
  id: string;
  storeId: string;
}

export const useDeleteGcashAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: DeleteGcashAccountParams) => {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase
        .from("gcash_accounts")
        .delete()
        .eq("id", params.id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["gcash-accounts", variables.storeId] });
      queryClient.invalidateQueries({ queryKey: ["gcash-accounts-all", variables.storeId] });
    },
  });
};
