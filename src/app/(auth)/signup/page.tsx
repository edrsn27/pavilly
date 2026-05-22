"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignUp } from "@/shared/queries/auth";
import { routes } from "@/navigation/routes";
import styles from "./signup.module.css";

interface SignUpFields {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

export default function SignupPage() {
  const router = useRouter();
  const { mutate: signUp, isPending } = useSignUp();
  const [apiError, setApiError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFields>({ mode: "onTouched" });

  const onSubmit = (data: SignUpFields) => {
    setApiError(null);
    signUp(
      {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim(),
        password: data.password,
      },
      {
        onSuccess: ({ requiresEmailConfirmation }) => {
          if (requiresEmailConfirmation) {
            setEmailSent(true);
          } else {
            router.push(routes.dashboard);
          }
        },
        onError: (err) => {
          setApiError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        },
      }
    );
  };

  return (
    <div className={styles.card}>

      {/* Mobile-only wordmark */}
      <Link href="/" className={styles.mobileWordmark}>Pavilly</Link>

      {emailSent ? (
        <div className={styles.successBanner}>
          <strong>Check your email</strong>
          <p>
            We sent a confirmation link to <strong>{watch("email")}</strong>.
            Click it to activate your account.
          </p>
        </div>
      ) : (
        <>
          <div className={styles.header}>
            <h1 className={styles.title}>Create your store</h1>
            <p className={styles.subtitle}>
              Register as a vendor and set up your stall. You can invite cashiers once your store is ready.
            </p>
          </div>

          {apiError && (
            <div className={styles.errorBanner} role="alert">
              {apiError}
            </div>
          )}

          <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="firstName" className={styles.label}>First name</label>
                <input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  placeholder="Maria"
                  aria-invalid={!!errors.firstName}
                  aria-describedby={errors.firstName ? "firstName-error" : undefined}
                  className={`${styles.input}${errors.firstName ? ` ${styles.inputError}` : ""}`}
                  {...register("firstName", { required: "First name is required." })}
                />
                {errors.firstName && (
                  <span id="firstName-error" className={styles.fieldError} role="alert">
                    {errors.firstName.message}
                  </span>
                )}
              </div>
              <div className={styles.field}>
                <label htmlFor="lastName" className={styles.label}>Last name</label>
                <input
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Santos"
                  aria-invalid={!!errors.lastName}
                  aria-describedby={errors.lastName ? "lastName-error" : undefined}
                  className={`${styles.input}${errors.lastName ? ` ${styles.inputError}` : ""}`}
                  {...register("lastName", { required: "Last name is required." })}
                />
                {errors.lastName && (
                  <span id="lastName-error" className={styles.fieldError} role="alert">
                    {errors.lastName.message}
                  </span>
                )}
              </div>
            </div>

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
              <label htmlFor="password" className={styles.label}>Password</label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
                className={`${styles.input}${errors.password ? ` ${styles.inputError}` : ""}`}
                {...register("password", {
                  required: "Password is required.",
                  minLength: { value: 8, message: "Password must be at least 8 characters." },
                })}
              />
              {errors.password && (
                <span id="password-error" className={styles.fieldError} role="alert">
                  {errors.password.message}
                </span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="confirmPassword" className={styles.label}>Confirm password</label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                className={`${styles.input}${errors.confirmPassword ? ` ${styles.inputError}` : ""}`}
                {...register("confirmPassword", {
                  required: "Please confirm your password.",
                  validate: (value) => value === watch("password") || "Passwords do not match.",
                })}
              />
              {errors.confirmPassword && (
                <span id="confirmPassword-error" className={styles.fieldError} role="alert">
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  aria-invalid={!!errors.terms}
                  aria-describedby={errors.terms ? "terms-error" : undefined}
                  className={styles.checkbox}
                  {...register("terms", { required: "You must agree to the terms." })}
                />
                <span className={styles.checkboxLabel}>
                  I agree to the{" "}
                  <Link href="/terms" className={styles.inlineLink}>Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="/privacy" className={styles.inlineLink}>Privacy Policy</Link>
                </span>
              </label>
              {errors.terms && (
                <span id="terms-error" className={styles.fieldError} role="alert">
                  {errors.terms.message}
                </span>
              )}
            </div>

            <button type="submit" className={styles.submitBtn} disabled={isPending}>
              {isPending ? "Creating account…" : "Create account"}
            </button>

          </form>

          <div className={styles.adminNote}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Joining as a cashier? Ask your vendor to send you an invite link instead.
          </div>

          <p className={styles.footer}>
            Already have an account?{" "}
            <Link href={routes.auth.login} className={styles.footerLink}>Sign in</Link>
          </p>
        </>
      )}

    </div>
  );
}
