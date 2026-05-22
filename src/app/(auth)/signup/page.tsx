import type { Metadata } from "next";
import Link from "next/link";
import styles from "./signup.module.css";

export const metadata: Metadata = {
  title: "Create account — Pavilly",
};

export default function SignupPage() {
  return (
    <div className={styles.card}>

      {/* Mobile-only wordmark */}
      <Link href="/" className={styles.mobileWordmark}>Pavilly</Link>

      <div className={styles.header}>
        <h1 className={styles.title}>Create your store</h1>
        <p className={styles.subtitle}>
          Register as a vendor and set up your stall. You can invite cashiers once your store is ready.
        </p>
      </div>

      <form className={styles.form} action="#" method="POST">

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label htmlFor="firstName" className={styles.label}>First name</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              required
              placeholder="Maria"
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="lastName" className={styles.label}>Last name</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              required
              placeholder="Santos"
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="password" className={styles.label}>Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="At least 8 characters"
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="confirmPassword" className={styles.label}>Confirm password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            placeholder="••••••••"
            className={styles.input}
          />
        </div>

        <label className={styles.checkboxRow}>
          <input type="checkbox" name="terms" required className={styles.checkbox} />
          <span className={styles.checkboxLabel}>
            I agree to the{" "}
            <Link href="/terms" className={styles.inlineLink}>Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy" className={styles.inlineLink}>Privacy Policy</Link>
          </span>
        </label>

        <button type="submit" className={styles.submitBtn}>
          Create account
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
        <Link href="/login" className={styles.footerLink}>Sign in</Link>
      </p>

    </div>
  );
}
