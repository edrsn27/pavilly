import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/shared/utils/supabase";

export interface CreateGcashTransactionParams {
  storeId: string;
  transactionType: "gcash_in" | "gcash_out";
  gcashAccountId: string;
  customerNumber?: string;
  amount: number;
  referenceNumber?: string;
  profit: number;
}

export const useCreateGcashTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateGcashTransactionParams) => {
      const supabase = createBrowserSupabaseClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: tx, error: txError } = await supabase
        .from("transactions")
        .insert({
          store_id: params.storeId,
          cashier_id: user.id,
          transaction_type: params.transactionType,
          total: params.amount,
          payment_method: "gcash",
          status: "completed",
        })
        .select()
        .single();

      if (txError) throw txError;

      const { error: detailError } = await supabase
        .from("gcash_transaction_details")
        .insert({
          transaction_id: tx.id,
          gcash_account_id: params.gcashAccountId,
          customer_number: params.customerNumber ?? null,
          reference_number: params.referenceNumber ?? null,
          amount: params.amount,
          profit: params.profit,
        });

      if (detailError) throw detailError;

      return tx;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["transactions", { storeId: variables.storeId }] });
      queryClient.invalidateQueries({ queryKey: ["gcash-accounts", variables.storeId] });
      queryClient.invalidateQueries({ queryKey: ["gcash-accounts-all", variables.storeId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats", variables.storeId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "recent-transactions", variables.storeId] });
    },
  });
};
