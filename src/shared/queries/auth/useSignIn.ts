import { useMutation } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/shared/utils/supabase";

interface SignInParams {
  email: string;
  password: string;
}

export interface SignInResult {
  role: "admin" | "vendor" | "cashier";
}

export const useSignIn = () =>
  useMutation({
    mutationFn: async ({ email, password }: SignInParams): Promise<SignInResult> => {
      const supabase = createBrowserSupabaseClient();

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profileError) throw profileError;

      return { role: profile.role as SignInResult["role"] };
    },
  });
