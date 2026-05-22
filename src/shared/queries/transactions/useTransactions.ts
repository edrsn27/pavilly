import { queryOptions, useQuery } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/shared/utils/supabase";

export type Transaction = {
  id: string;
  store_id: string;
  cashier_id: string;
  transaction_type: "sale" | "gcash_in" | "gcash_out";
  total: number;
  payment_method: "cash" | "gcash" | "maya" | "card";
  amount_tendered: number | null;
  change: number | null;
  status: "completed" | "voided" | "refunded";
  notes: string | null;
  created_at: string;
};

export const transactionsQueryOptions = (storeId: string) =>
  queryOptions({
    queryKey: ["transactions", { storeId }],
    queryFn: async (): Promise<Transaction[]> => {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false });
      if (error) return [];
      return (data ?? []) as Transaction[];
    },
    staleTime: 1000 * 60,
    retry: false,
  });

export const useTransactions = (storeId: string) =>
  useQuery(transactionsQueryOptions(storeId));
