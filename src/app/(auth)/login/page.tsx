import type { Metadata } from "next";
import Link from "next/link";
import styles from "./login.module.css";

export const metadata: Metadata = {
  title: "Sign in — Pavilly",
};

export default function LoginPage() {
  return (
    <div className={styles.card}>

      {/* Mobile-only wordmark */}
      <Link href="/" className={styles.mobileWordmark}>Pavilly</Link>

      <div className={styles.header}>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>
          Sign in to your Pavilly account to continue.
        </p>
      </div>

      <form className={styles.form} action="#" method="POST">

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
          <div className={styles.labelRow}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <Link href="/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className={styles.input}
          />
        </div>

        <label className={styles.checkboxRow}>
          <input type="checkbox" name="remember" className={styles.checkbox} />
          <span className={styles.checkboxLabel}>Remember me for 30 days</span>
        </label>

        <button type="submit" className={styles.submitBtn}>
          Sign in
        </button>

      </form>

      <div className={styles.divider}>
        <span>or</span>
      </div>

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
        <Link href="/signup" className={styles.footerLink}>Create an account</Link>
      </p>

    </div>
  );
}
