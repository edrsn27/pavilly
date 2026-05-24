import { useMutation } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/shared/utils/supabase";

interface SignUpParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignUpResult {
  /** null when Supabase requires email confirmation */
  requiresEmailConfirmation: boolean;
}

export const useSignUp = () =>
  useMutation({
    mutationFn: async ({
      firstName,
      lastName,
      email,
      password,
    }: SignUpParams): Promise<SignUpResult> => {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: `${firstName} ${lastName}`.trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      return { requiresEmailConfirmation: !data.session };
    },
  });
