import { useQuery } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/shared/utils/supabase";

export interface StoreRecentTransaction {
  id: string;
  total: number;
  payment_method: string;
  status: string;
  transaction_type: string;
  created_at: string;
}

export const useStoreRecentTransactions = (storeId: string) =>
  useQuery({
    queryKey: ["dashboard", "recent-transactions", storeId],
    queryFn: async (): Promise<StoreRecentTransaction[]> => {
      const supabase = createBrowserSupabaseClient();
      const { data } = await supabase
        .from("transactions")
        .select("id, total, payment_method, status, transaction_type, created_at")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false })
        .limit(10);

      return data ?? [];
    },
    staleTime: 1000 * 60,
    retry: false,
  });
