import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/shared/utils/supabase";
import { inventoryQueryKey } from "@/shared/queries/inventory";

export interface TransactionLineInput {
  productId: string;
  productName: string;
  costPrice: number | null;
  sellingPrice: number;
  quantity: number;
  subtotal: number;
}

export interface CreateTransactionParams {
  storeId: string;
  paymentMethod: "cash" | "gcash" | "maya" | "card";
  amountTendered?: number | null;
  change?: number | null;
  notes?: string;
  items: TransactionLineInput[];
}

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateTransactionParams) => {
      const supabase = createBrowserSupabaseClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Not authenticated");

      const total = params.items.reduce((sum, item) => sum + item.subtotal, 0);

      const { data: tx, error: txError } = await supabase
        .from("transactions")
        .insert({
          store_id: params.storeId,
          cashier_id: user.id,
          transaction_type: "sale",
          total,
          payment_method: params.paymentMethod,
          amount_tendered: params.amountTendered ?? null,
          change: params.change ?? null,
          notes: params.notes ?? null,
          status: "completed",
        })
        .select("id")
        .single();

      if (txError) throw txError;

      const lineItems = params.items.map((item) => ({
        transaction_id: tx.id,
        product_id: item.productId,
        product_name: item.productName,
        cost_price: item.costPrice,
        selling_price: item.sellingPrice,
        quantity: item.quantity,
        subtotal: item.subtotal,
      }));

      const { error: itemsError } = await supabase
        .from("transaction_items")
        .insert(lineItems);

      if (itemsError) throw itemsError;

      return { transactionId: tx.id, total };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: inventoryQueryKey(variables.storeId),
      });
    },
  });
};
