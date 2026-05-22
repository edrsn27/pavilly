import { useQuery } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/shared/utils/supabase";

export interface Category {
  id: string;
  name: string;
  sort_order: number;
}

export const categoriesQueryKey = (storeId: string) =>
  ["categories", { storeId }] as const;

export const useCategories = (storeId: string) =>
  useQuery({
    queryKey: categoriesQueryKey(storeId),
    queryFn: async (): Promise<Category[]> => {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, sort_order")
        .eq("store_id", storeId)
        .order("sort_order", { ascending: true });

      if (error) return [];
      return data ?? [];
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
