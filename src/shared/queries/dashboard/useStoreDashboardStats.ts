import { useQuery } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/shared/utils/supabase";

export interface StoreDashboardStats {
  todaySales: number;
  todayTransactions: number;
  todayGcashProfit: number;
  todayGcashServices: number;
}

export const useStoreDashboardStats = (storeId: string, date: string) =>
  useQuery({
    queryKey: ["dashboard", "stats", storeId, date],
    queryFn: async (): Promise<StoreDashboardStats> => {
      const supabase = createBrowserSupabaseClient();

      const [y, m, d] = date.split("-").map(Number);
      const dayStart = new Date(y, m - 1, d, 0, 0, 0, 0);
      const dayEnd = new Date(y, m - 1, d, 23, 59, 59, 999);

      const { data: txns } = await supabase
        .from("transactions")
        .select("total, transaction_type")
        .eq("store_id", storeId)
        .eq("status", "completed")
        .gte("created_at", dayStart.toISOString())
        .lte("created_at", dayEnd.toISOString());

      const todaySales = (txns ?? [])
        .filter((t) => t.transaction_type === "sale")
        .reduce((sum, t) => sum + Number(t.total), 0);

      const { data: gcashTxns } = await supabase
        .from("transactions")
        .select("gcash_transaction_details(profit)")
        .eq("store_id", storeId)
        .eq("status", "completed")
        .in("transaction_type", ["gcash_in", "gcash_out"])
        .gte("created_at", dayStart.toISOString())
        .lte("created_at", dayEnd.toISOString());

      const gcashDetails = (gcashTxns ?? []).flatMap(
        (t: { gcash_transaction_details: { profit: number }[] }) =>
          t.gcash_transaction_details ?? []
      );
      const todayGcashProfit = gcashDetails.reduce(
        (sum, d) => sum + Number(d.profit),
        0
      );

      return {
        todaySales,
        todayTransactions: txns?.length ?? 0,
        todayGcashProfit,
        todayGcashServices: gcashDetails.length,
      };
    },
    staleTime: 1000 * 60,
    retry: false,
  });
