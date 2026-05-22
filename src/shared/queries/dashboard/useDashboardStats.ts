import { useQuery } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/shared/utils/supabase";

export interface DashboardStats {
  todayRevenue: number;
  todayTransactions: number;
  lowStockCount: number;
  activeProducts: number;
}

export const useDashboardStats = () =>
  useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async (): Promise<DashboardStats> => {
      const supabase = createBrowserSupabaseClient();

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [
        { data: txns },
        { data: inventory },
        { count: activeProducts },
      ] = await Promise.all([
        supabase
          .from("transactions")
          .select("total, transaction_type")
          .eq("status", "completed")
          .gte("created_at", todayStart.toISOString()),

        supabase.from("inventory").select("stock, low_stock_threshold"),

        supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true),
      ]);

      const todayRevenue = (txns ?? [])
        .filter((t) => t.transaction_type === "sale")
        .reduce((sum, t) => sum + Number(t.total), 0);

      const lowStockCount = (inventory ?? []).filter(
        (i) => i.stock <= i.low_stock_threshold
      ).length;

      return {
        todayRevenue,
        todayTransactions: txns?.length ?? 0,
        lowStockCount,
        activeProducts: activeProducts ?? 0,
      };
    },
    staleTime: 1000 * 60,
    retry: false,
  });
