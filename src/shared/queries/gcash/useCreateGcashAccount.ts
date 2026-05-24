import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/shared/utils/supabase";

export interface CreateGcashAccountParams {
  storeId: string;
  name: string;
  number: string;
  initialBalance: number;
}

export const useCreateGcashAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateGcashAccountParams) => {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("gcash_accounts")
        .insert({
          store_id: params.storeId,
          name: params.name,
          number: params.number,
          balance: params.initialBalance,
          is_active: true,
        })
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
