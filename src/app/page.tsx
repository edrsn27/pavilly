import { cookies } from "next/headers";
import Link from "next/link";
import { createClient } from "@/shared/utils/supabase/server";
import { AccountMenu } from "@/widgets/AccountMenu";
import styles from "./page.module.css";

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;
  return (
    <div className={styles.root}>

      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <span className={styles.wordmark}>Pavilly</span>
          <nav className={styles.navLinks}>
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
          </nav>
          {isAuthenticated
            ? <AccountMenu />
            : <Link href="/login" className={styles.navCta}>Get started</Link>
          }
        </div>
      </header>

      <main className={styles.main}>

        {/* ── Hero ────────────────────────────────────────────────────── */}
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.heroBadge}>
              <span className={styles.badgeDot} />
              Built for family stores
            </div>
            <h1 className={styles.heroHeading}>
              Your sari sari store,<br />
              <span className={styles.heroAccent}>running smarter.</span>
            </h1>
            <p className={styles.heroSub}>
              Pavilly brings every vendor under one roof — a shared point of
              sale, real-time inventory, and clear earnings reports so every
              family member knows exactly how the store is doing.
            </p>
            <div className={styles.heroCtas}>
              <Link href="/login" className={styles.btnPrimary}>Open the POS</Link>
              <a href="#features" className={styles.btnGhost}>See what&rsquo;s inside</a>
            </div>
          </div>
          <div className={styles.heroVisual} aria-hidden="true">
            <div className={styles.mockScreen}>
              <div className={styles.mockBar} />
              <div className={styles.mockGrid}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className={styles.mockTile} />
                ))}
              </div>
              <div className={styles.mockCart}>
                <div className={styles.mockCartRow} />
                <div className={styles.mockCartRow} style={{ width: "70%" }} />
                <div className={styles.mockCartRow} style={{ width: "85%" }} />
                <div className={styles.mockCartTotal} />
              </div>
            </div>
          </div>
        </section>

        {/* ── Social proof strip ──────────────────────────────────────── */}
        <section className={styles.strip}>
          <p className={styles.stripText}>
            One store. Multiple vendors. Every peso tracked.
          </p>
        </section>

        {/* ── Features ────────────────────────────────────────────────── */}
        <section id="features" className={styles.features}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Everything the store needs</h2>
            <p className={styles.sectionSub}>
              From checking out a cold drink to closing out a vendor&rsquo;s daily
              sales — Pavilly handles it without the paper trail.
            </p>
          </div>
          <div className={styles.featureGrid}>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Multi-vendor POS</h3>
              <p className={styles.featureDesc}>
                Each vendor manages their own products and prices. The shared
                POS terminal rings up items from any stall in a single
                transaction — no separate cashiers needed.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2"/>
                  <path d="M8 21h8M12 17v4"/>
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Real-time inventory</h3>
              <p className={styles.featureDesc}>
                Stock counts update the moment a sale is made. Low-stock alerts
                tell you before you run out — so shelves stay full and
                customers leave happy.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Vendor earnings</h3>
              <p className={styles.featureDesc}>
                Every vendor sees exactly what they sold and what they earned —
                daily, weekly, or monthly. No disputes, no manual tallying,
                no end-of-day guesswork.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Sales reports</h3>
              <p className={styles.featureDesc}>
                See what&rsquo;s selling, what&rsquo;s slow, and when the store is
                busiest. Simple charts give the whole family a clear picture
                without needing an accountant.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Role-based access</h3>
              <p className={styles.featureDesc}>
                Admins see everything. Vendors manage their own stall. Cashiers
                run the register. Everyone gets exactly the access they need —
                nothing more, nothing less.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                  <line x1="12" y1="18" x2="12.01" y2="18"/>
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Works on any device</h3>
              <p className={styles.featureDesc}>
                The POS is designed for tablets and phones — big tap targets,
                fast checkout, and a layout that makes sense on a busy store
                counter.
              </p>
            </div>

          </div>
        </section>

        {/* ── How it works ────────────────────────────────────────────── */}
        <section id="how-it-works" className={styles.howItWorks}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Up and running in minutes</h2>
            <p className={styles.sectionSub}>
              No training required. If you can run a sari sari store, you can
              run Pavilly.
            </p>
          </div>
          <ol className={styles.steps}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>01</span>
              <div>
                <h3 className={styles.stepTitle}>Admin sets up the store</h3>
                <p className={styles.stepDesc}>
                  Create the store, invite vendors, and set up their stalls.
                  Takes five minutes — then vendors take over their own section.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>02</span>
              <div>
                <h3 className={styles.stepTitle}>Vendors add their products</h3>
                <p className={styles.stepDesc}>
                  Each vendor logs in and adds their products with prices and
                  stock counts. Categories and photos keep the POS grid
                  clean and fast to navigate.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>03</span>
              <div>
                <h3 className={styles.stepTitle}>Cashier opens the POS</h3>
                <p className={styles.stepDesc}>
                  Tap products, add to cart, collect payment. The system
                  records the sale, updates inventory, and credits the right
                  vendor automatically.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* ── CTA banner ──────────────────────────────────────────────── */}
        <section className={styles.ctaBanner}>
          <h2 className={styles.ctaHeading}>
            Ready to bring the family store online?
          </h2>
          <p className={styles.ctaSub}>
            Open the POS and start selling. No setup fee, no subscription —
            just a smarter way to run the store your family built.
          </p>
          <Link href="/login" className={styles.btnPrimaryLg}>
            Get started now
          </Link>
        </section>

      </main>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span className={styles.footerWordmark}>Pavilly</span>
          <p className={styles.footerTagline}>
            The sari sari store POS built with family in mind.
          </p>
        </div>
      </footer>

    </div>
  );
}
