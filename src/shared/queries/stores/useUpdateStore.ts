import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/shared/utils/supabase";
import { currentStoreQueryKey } from "./useCurrentStore";
import { myStoresQueryKey } from "./useMyStores";

interface UpdateStoreParams {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
}

export const useUpdateStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...patch }: UpdateStoreParams) => {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("stores")
        .update(patch)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: currentStoreQueryKey });
      queryClient.invalidateQueries({ queryKey: myStoresQueryKey });
    },
  });
};
