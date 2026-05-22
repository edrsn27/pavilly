import { useQuery } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/shared/utils/supabase";

export interface RecentTransaction {
  id: string;
  total: number;
  payment_method: string;
  status: string;
  transaction_type: string;
  created_at: string;
}

export const useRecentTransactions = () =>
  useQuery({
    queryKey: ["dashboard", "recent-transactions"],
    queryFn: async (): Promise<RecentTransaction[]> => {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("transactions")
        .select("id, total, payment_method, status, transaction_type, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) return [];
      return data ?? [];
    },
    staleTime: 1000 * 60,
    retry: false,
  });
