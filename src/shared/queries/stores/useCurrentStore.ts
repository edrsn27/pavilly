import { useQuery } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/shared/utils/supabase";

export interface Store {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
}

export const currentStoreQueryKey = ["stores", "mine"] as const;

export const useCurrentStore = () =>
  useQuery({
    queryKey: currentStoreQueryKey,
    queryFn: async (): Promise<Store | null> => {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("stores")
        .select("id, name, description, logo_url, is_active, created_at")
        .limit(1)
        .maybeSingle();

      if (error) return null;
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
