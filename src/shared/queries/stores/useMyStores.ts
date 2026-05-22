import { useQuery } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/shared/utils/supabase";
import type { Store } from "./useCurrentStore";

export const myStoresQueryKey = ["stores", "mine", "all"] as const;

export const useMyStores = () =>
  useQuery({
    queryKey: myStoresQueryKey,
    queryFn: async (): Promise<Store[]> => {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("stores")
        .select("id, name, description, logo_url, is_active, created_at")
        .order("created_at", { ascending: true });

      if (error) return [];
      return data ?? [];
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
