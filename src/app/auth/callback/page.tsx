"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/shared/utils/supabase";
import styles from "./callback.module.css";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      router.replace("/login?error=confirmation_failed");
      return;
    }

    const supabase = createBrowserSupabaseClient();
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        router.replace("/login?error=confirmation_failed");
      } else {
        router.replace("/dashboard");
      }
    });
  }, [router, searchParams]);

  return null;
}

export default function AuthCallbackPage() {
  return (
    <div className={styles.root}>
      <div className={styles.spinner} aria-hidden="true" />
      <p className={styles.message}>Confirming your account…</p>
      <Suspense>
        <CallbackHandler />
      </Suspense>
    </div>
  );
}
