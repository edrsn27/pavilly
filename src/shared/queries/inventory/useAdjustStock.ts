import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/shared/utils/supabase";
import { inventoryQueryKey } from "./useInventory";
import { productsQueryKey } from "@/shared/queries/products";

export interface AdjustStockParams {
  storeId: string;
  inventoryId: string;
  productId: string;
  currentStock: number;
  /** "add" adds to current stock; "set" replaces it */
  mode: "add" | "set";
  amount: number;
  notes?: string;
}

export const useAdjustStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      inventoryId,
      productId,
      currentStock,
      mode,
      amount,
      notes,
    }: AdjustStockParams) => {
      const supabase = createBrowserSupabaseClient();
      const newStock = mode === "add" ? currentStock + amount : amount;
      const change = newStock - currentStock;

      const { error: invError } = await supabase
        .from("inventory")
        .update({ stock: newStock })
        .eq("id", inventoryId);

      if (invError) throw invError;

      const { data: { user } } = await supabase.auth.getUser();

      await supabase.from("inventory_logs").insert({
        product_id: productId,
        change,
        reason: mode === "add" ? "restock" : "adjustment",
        notes: notes?.trim() || null,
        created_by: user?.id,
      });

      return { newStock };
    },
    onSuccess: (_, { storeId }) => {
      queryClient.invalidateQueries({ queryKey: inventoryQueryKey(storeId) });
      queryClient.invalidateQueries({ queryKey: productsQueryKey(storeId) });
    },
  });
};
