import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/shared/utils/supabase";
import { inventoryQueryKey } from "@/shared/queries/inventory";

export interface VoidTransactionsParams {
  ids: string[];
  storeId: string;
  voidReason: string;
}

export const useVoidTransactions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, voidReason }: VoidTransactionsParams) => {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("transactions")
        .update({ status: "voided", void_reason: voidReason })
        .in("id", ids)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["transactions", { storeId: variables.storeId }] });
      queryClient.invalidateQueries({ queryKey: inventoryQueryKey(variables.storeId) });
      queryClient.invalidateQueries({ queryKey: ["gcash-accounts", variables.storeId] });
      queryClient.invalidateQueries({ queryKey: ["gcash-accounts-all", variables.storeId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats", variables.storeId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "recent-transactions", variables.storeId] });
    },
  });
};
