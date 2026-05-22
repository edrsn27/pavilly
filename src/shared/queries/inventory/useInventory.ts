import { useQuery } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/shared/utils/supabase";

export interface InventoryItem {
  inventoryId: string;
  productId: string;
  productName: string;
  priceType: "fixed" | "variable";
  isActive: boolean;
  stock: number;
  lowStockThreshold: number;
  updatedAt: string;
}

export const inventoryQueryKey = (storeId: string) =>
  ["inventory", { storeId }] as const;

export const useInventory = (storeId: string) =>
  useQuery({
    queryKey: inventoryQueryKey(storeId),
    queryFn: async (): Promise<InventoryItem[]> => {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("products")
        .select(
          "id, name, price_type, is_active, inventory(id, stock, low_stock_threshold, updated_at)"
        )
        .eq("store_id", storeId)
        .order("name", { ascending: true });

      if (error) return [];

      return (data ?? []).flatMap((p) => {
        const inv = Array.isArray(p.inventory) ? p.inventory[0] : p.inventory;
        if (!inv) return [];
        return {
          inventoryId: inv.id,
          productId: p.id,
          productName: p.name,
          priceType: p.price_type as "fixed" | "variable",
          isActive: p.is_active,
          stock: inv.stock,
          lowStockThreshold: inv.low_stock_threshold,
          updatedAt: inv.updated_at,
        };
      });
    },
    staleTime: 1000 * 30,
    retry: false,
  });
