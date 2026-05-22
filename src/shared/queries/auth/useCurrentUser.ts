import { useQuery } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/shared/utils/supabase";

export const currentUserQueryKey = ["auth", "user"] as const;

export const useCurrentUser = () =>
  useQuery({
    queryKey: currentUserQueryKey,
    queryFn: async () => {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase.auth.getUser();
      if (error) return null;
      return data.user;
    },
    staleTime: Infinity,
    retry: false,
  });
