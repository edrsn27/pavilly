import { useMutation } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/shared/utils/supabase";

interface SignInParams {
  email: string;
  password: string;
}

export interface SignInResult {
  /** System-level role — only 'admin' is elevated; everyone else is 'user'. */
  role: "admin" | "user";
  /** true if the user owns at least one store */
  hasStore: boolean;
  /** true if the user is a member of a store but does not own one */
  isMemberOnly: boolean;
}

export const useSignIn = () =>
  useMutation({
    mutationFn: async ({ email, password }: SignInParams): Promise<SignInResult> => {
      const supabase = createBrowserSupabaseClient();

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const userId = data.user.id;

      const [
        { data: profile, error: profileError },
        { count: storeCount },
        { count: memberCount },
      ] = await Promise.all([
        supabase.from("users").select("role").eq("id", userId).single(),
        supabase.from("stores").select("*", { count: "exact", head: true }).eq("owner_id", userId),
        supabase.from("store_members").select("*", { count: "exact", head: true }).eq("user_id", userId),
      ]);

      if (profileError) throw profileError;

      const hasStore = (storeCount ?? 0) > 0;
      const isMemberOnly = !hasStore && (memberCount ?? 0) > 0;

      return {
        role: profile.role as SignInResult["role"],
        hasStore,
        isMemberOnly,
      };
    },
  });
