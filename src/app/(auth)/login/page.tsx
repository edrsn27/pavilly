"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignIn } from "@/shared/queries/auth";
import { routes } from "@/navigation/routes";
import styles from "./login.module.css";

interface LoginFields {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { mutate: signIn, isPending } = useSignIn();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFields>({ mode: "onTouched" });

  const onSubmit = (data: LoginFields) => {
    setApiError(null);
    signIn(
      { email: data.email.trim(), password: data.password },
      {
        onSuccess: ({ isMemberOnly }) => {
          router.push(routes.dashboard);
        },
        onError: (err) => {
          setApiError(
            err instanceof Error ? err.message : "Something went wrong. Please try again."
          );
        },
      }
    );
  };

  return (
    <div className={styles.card}>

      {/* Mobile-only wordmark */}
      <Link href="/" className={styles.mobileWordmark}>Pavilly</Link>

      <div className={styles.header}>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Sign in to your Pavilly account to continue.</p>
      </div>

      {apiError && (
        <div className={styles.errorBanner} role="alert">
          {apiError}
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>

        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>Email address</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={`${styles.input}${errors.email ? ` ${styles.inputError}` : ""}`}
            {...register("email", {
              required: "Email is required.",
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address." },
            })}
          />
          {errors.email && (
            <span id="email-error" className={styles.fieldError} role="alert">
              {errors.email.message}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <Link href="/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            className={`${styles.input}${errors.password ? ` ${styles.inputError}` : ""}`}
            {...register("password", { required: "Password is required." })}
          />
          {errors.password && (
            <span id="password-error" className={styles.fieldError} role="alert">
              {errors.password.message}
            </span>
          )}
        </div>

        <button type="submit" className={styles.submitBtn} disabled={isPending}>
          {isPending ? "Signing in…" : "Sign in"}
        </button>

      </form>

      <div className={styles.divider}><span>or</span></div>

      <div className={styles.roleHint}>
        <div className={styles.roleCard}>
          <span className={styles.roleIcon} aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
              <line x1="12" y1="18" x2="12.01" y2="18"/>
            </svg>
          </span>
          <div>
            <p className={styles.roleCardTitle}>Opening the POS?</p>
            <p className={styles.roleCardSub}>Sign in as a vendor or cashier to launch the terminal.</p>
          </div>
        </div>
      </div>

      <p className={styles.footer}>
        New to Pavilly?{" "}
        <Link href={routes.auth.signup} className={styles.footerLink}>Create an account</Link>
      </p>

    </div>
  );
}
