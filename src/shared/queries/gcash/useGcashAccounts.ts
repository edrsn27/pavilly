import { queryOptions, useQuery } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/shared/utils/supabase";

export interface GcashAccount {
  id: string;
  name: string;
  number: string;
  balance: number;
}

export const gcashAccountsQueryOptions = (storeId: string) =>
  queryOptions({
    queryKey: ["gcash-accounts", storeId],
    queryFn: async (): Promise<GcashAccount[]> => {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("gcash_accounts")
        .select("id, name, number, balance")
        .eq("store_id", storeId)
        .eq("is_active", true)
        .order("name");
      if (error) return [];
      return data ?? [];
    },
    staleTime: 1000 * 60,
    retry: false,
  });

export const useGcashAccounts = (storeId: string) =>
  useQuery(gcashAccountsQueryOptions(storeId));
