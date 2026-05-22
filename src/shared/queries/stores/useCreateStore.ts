import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/shared/utils/supabase";
import { currentStoreQueryKey } from "./useCurrentStore";
import { myStoresQueryKey } from "./useMyStores";

interface CreateStoreParams {
  name: string;
  description?: string;
  logo_url?: string;
}

export const useCreateStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateStoreParams) => {
      const supabase = createBrowserSupabaseClient();

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Not authenticated.");

      const { data, error } = await supabase
        .from("stores")
        .insert({ ...params, owner_id: user.id })
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
