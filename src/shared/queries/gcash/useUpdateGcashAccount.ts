import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/shared/utils/supabase";

export interface UpdateGcashAccountParams {
  id: string;
  storeId: string;
  name: string;
  number: string;
  is_active: boolean;
}

export const useUpdateGcashAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateGcashAccountParams) => {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("gcash_accounts")
        .update({ name: params.name, number: params.number, is_active: params.is_active })
        .eq("id", params.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["gcash-accounts", variables.storeId] });
      queryClient.invalidateQueries({ queryKey: ["gcash-accounts-all", variables.storeId] });
    },
  });
};
