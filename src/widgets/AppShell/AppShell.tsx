"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard,
  MonitorSmartphone,
  Package,
  Tag,
  Warehouse,
  ReceiptText,
  MoreHorizontal,
  X,
} from "lucide-react";
import { AccountMenu } from "@/widgets/AccountMenu";
import { StoreSwitcher } from "@/widgets/StoreSwitcher";
import { routes } from "@/navigation/routes";
import styles from "./AppShell.module.css";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const params = useParams();
  const storeId = typeof params.id === "string" ? params.id : undefined;
  const [fabOpen, setFabOpen] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!fabOpen) return;
    const handler = (e: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(e.target as Node)) {
        setFabOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [fabOpen]);

  useEffect(() => { setFabOpen(false); }, [pathname]);

  const navItems = storeId
    ? [
        { href: routes.store.pos(storeId),          label: "POS Terminal", Icon: MonitorSmartphone },
        { href: routes.store.products(storeId),      label: "Products",     Icon: Package },
        { href: routes.store.categories(storeId),    label: "Categories",   Icon: Tag },
        { href: routes.store.inventory(storeId),     label: "Inventory",    Icon: Warehouse },
        { href: routes.store.transactions(storeId),  label: "Transactions", Icon: ReceiptText },
      ]
    : [
        { href: routes.dashboard, label: "Dashboard", Icon: LayoutDashboard },
      ];

  const mobileNavItems = storeId
    ? [
        { href: routes.store.dashboard(storeId),     label: "Dashboard", Icon: LayoutDashboard },
        { href: routes.store.pos(storeId),           label: "POS",       Icon: MonitorSmartphone },
        { href: routes.store.products(storeId),      label: "Products",  Icon: Package },
        { href: routes.store.inventory(storeId),     label: "Inventory", Icon: Warehouse },
      ]
    : [{ href: routes.dashboard, label: "Dashboard", Icon: LayoutDashboard }];

  const fabItems = storeId
    ? [
        { href: routes.store.categories(storeId),   label: "Categories",   Icon: Tag },
        { href: routes.store.transactions(storeId), label: "Transactions", Icon: ReceiptText },
      ]
    : [];

  return (
    <div className={styles.shell}>
      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <Link href="/" className={styles.wordmark}>Pavilly</Link>
        </div>

        <nav className={styles.nav} aria-label="Main navigation">
          {navItems.map(({ href, label, Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={`${styles.navItem}${active ? ` ${styles.navItemActive}` : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <Icon
                  size={18}
                  strokeWidth={active ? 2 : 1.75}
                  aria-hidden="true"
                />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────── */}
      <div className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            {storeId && <StoreSwitcher />}
          </div>
          <AccountMenu />
        </header>

        <main className={styles.content}>
          {children}
        </main>

        {/* ── Bottom nav (mobile only) ──────────────────────────── */}
        <nav className={styles.bottomNav} aria-label="Main navigation">
          {mobileNavItems.map(({ href, label, Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={`${styles.bottomNavItem}${active ? ` ${styles.bottomNavItemActive}` : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <Icon
                  size={20}
                  strokeWidth={active ? 2 : 1.75}
                  aria-hidden="true"
                />
                <span className={styles.bottomNavLabel}>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* ── FAB for overflow nav items (mobile only) ──────────── */}
        {fabItems.length > 0 && (
          <div className={styles.fab} ref={fabRef}>
            {fabOpen && (
              <div className={styles.fabMenu} role="menu">
                {fabItems.map(({ href, label, Icon }) => {
                  const active = pathname === href || pathname.startsWith(`${href}/`);
                  return (
                    <Link
                      key={href}
                      href={href}
                      role="menuitem"
                      className={`${styles.fabMenuItem}${active ? ` ${styles.fabMenuItemActive}` : ""}`}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setFabOpen(false)}
                    >
                      <Icon size={20} strokeWidth={active ? 2 : 1.75} aria-hidden="true" />
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
            <button
              className={`${styles.fabButton}${fabOpen ? ` ${styles.fabButtonOpen}` : ""}`}
              onClick={() => setFabOpen((v) => !v)}
              aria-label={fabOpen ? "Close menu" : "More navigation options"}
              aria-expanded={fabOpen}
            >
              {fabOpen
                ? <X size={22} aria-hidden="true" />
                : <MoreHorizontal size={22} aria-hidden="true" />
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
