import { queryOptions, useQuery } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/shared/utils/supabase";
import type { GcashAccount } from "./useGcashAccounts";

export interface GcashAccountFull extends GcashAccount {
  is_active: boolean;
  created_at: string;
}

export const gcashAccountsAllQueryOptions = (storeId: string) =>
  queryOptions({
    queryKey: ["gcash-accounts-all", storeId],
    queryFn: async (): Promise<GcashAccountFull[]> => {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("gcash_accounts")
        .select("id, name, number, balance, is_active, created_at")
        .eq("store_id", storeId)
        .order("created_at");
      if (error) return [];
      return data ?? [];
    },
    staleTime: 1000 * 60,
    retry: false,
  });

export const useGcashAccountsAll = (storeId: string) =>
  useQuery(gcashAccountsAllQueryOptions(storeId));
