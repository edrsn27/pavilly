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

export const useStoreRecentTransactions = (storeId: string, date: string) =>
  useQuery({
    queryKey: ["dashboard", "recent-transactions", storeId, date],
    queryFn: async (): Promise<StoreRecentTransaction[]> => {
      const supabase = createBrowserSupabaseClient();

      const [y, m, d] = date.split("-").map(Number);
      const dayStart = new Date(y, m - 1, d, 0, 0, 0, 0);
      const dayEnd = new Date(y, m - 1, d, 23, 59, 59, 999);

      const { data } = await supabase
        .from("transactions")
        .select("id, total, payment_method, status, transaction_type, created_at")
        .eq("store_id", storeId)
        .gte("created_at", dayStart.toISOString())
        .lte("created_at", dayEnd.toISOString())
        .order("created_at", { ascending: false })
        .limit(50);

      return data ?? [];
    },
    staleTime: 1000 * 60,
    retry: false,
  });
