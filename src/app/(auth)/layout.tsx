import Link from "next/link";
import styles from "./auth.module.css";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.shell}>
      {/* ── Brand panel ──────────────────────────────────────────── */}
      <aside className={styles.brand}>
        <Link href="/" className={styles.brandWordmark}>Pavilly</Link>
        <div className={styles.brandBody}>
          <p className={styles.brandQuote}>
            &ldquo;Every peso in, every peso out &mdash; clear as day.&rdquo;
          </p>
          <div className={styles.brandFeatures}>
            <div className={styles.brandFeature}>
              <span className={styles.brandCheck} aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              Multi-vendor POS terminal
            </div>
            <div className={styles.brandFeature}>
              <span className={styles.brandCheck} aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              Real-time inventory tracking
            </div>
            <div className={styles.brandFeature}>
              <span className={styles.brandCheck} aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              Per-vendor earnings reports
            </div>
            <div className={styles.brandFeature}>
              <span className={styles.brandCheck} aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              Works on any phone or tablet
            </div>
          </div>
        </div>
        <p className={styles.brandFooter}>
          The sari sari store POS built with family in mind.
        </p>
      </aside>

      {/* ── Form panel ───────────────────────────────────────────── */}
      <main className={styles.formPanel}>
        {children}
      </main>
    </div>
  );
}
