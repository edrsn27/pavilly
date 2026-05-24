import { useQuery } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/shared/utils/supabase";

export interface StoreDashboardStats {
  todaySales: number;
  todayTransactions: number;
  todayGcashProfit: number;
  todayGcashServices: number;
}

export const useStoreDashboardStats = (storeId: string) =>
  useQuery({
    queryKey: ["dashboard", "stats", storeId],
    queryFn: async (): Promise<StoreDashboardStats> => {
      const supabase = createBrowserSupabaseClient();

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { data: txns } = await supabase
        .from("transactions")
        .select("total, transaction_type")
        .eq("store_id", storeId)
        .eq("status", "completed")
        .gte("created_at", todayStart.toISOString());

      const todaySales = (txns ?? [])
        .filter((t) => t.transaction_type === "sale")
        .reduce((sum, t) => sum + Number(t.total), 0);

      const { data: gcashTxns } = await supabase
        .from("transactions")
        .select("gcash_transaction_details(profit)")
        .eq("store_id", storeId)
        .eq("status", "completed")
        .in("transaction_type", ["gcash_in", "gcash_out"])
        .gte("created_at", todayStart.toISOString());

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
