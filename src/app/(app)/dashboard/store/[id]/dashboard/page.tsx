"use client";

import { use, useState } from "react";
import { TrendingUp, ShoppingCart, Zap, CreditCard, Wallet } from "lucide-react";
import { useStoreDashboardStats } from "@/shared/queries/dashboard";
import { useStoreRecentTransactions } from "@/shared/queries/dashboard";
import type { StoreRecentTransaction } from "@/shared/queries/dashboard";
import styles from "./page.module.css";

const formatPeso = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDateLabel(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(y, m - 1, d));
}

const TYPE_LABEL: Record<string, string> = {
  sale:       "Sale",
  gcash_in:   "GCash In",
  gcash_out:  "GCash Out",
};

const PAYMENT_LABEL: Record<string, string> = {
  cash:  "Cash",
  gcash: "GCash",
  maya:  "Maya",
  card:  "Card",
};

function TypeIcon({ type }: { type: string }) {
  if (type === "gcash_in" || type === "gcash_out") {
    return <Zap size={14} strokeWidth={2} aria-hidden="true" />;
  }
  return <ShoppingCart size={14} strokeWidth={2} aria-hidden="true" />;
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}

function TxRow({ tx }: { tx: StoreRecentTransaction }) {
  const isVoided = tx.status === "voided";
  const isRefunded = tx.status === "refunded";
  const label = TYPE_LABEL[tx.transaction_type] ?? tx.transaction_type;
  const payment = PAYMENT_LABEL[tx.payment_method] ?? tx.payment_method;

  return (
    <li className={`${styles.txRow}${isVoided || isRefunded ? ` ${styles.txRowMuted}` : ""}`}>
      <div className={styles.txIcon} aria-hidden="true">
        <TypeIcon type={tx.transaction_type} />
      </div>
      <div className={styles.txMeta}>
        <span className={styles.txLabel}>{label} · {payment}</span>
        <span className={styles.txTime}>{formatTime(tx.created_at)}</span>
      </div>
      <div className={styles.txRight}>
        <span className={styles.txAmount}>{formatPeso(tx.total)}</span>
        {(isVoided || isRefunded) && (
          <span className={styles.txBadge}>
            {isVoided ? "Voided" : "Refunded"}
          </span>
        )}
      </div>
    </li>
  );
}

export default function StoreDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: storeId } = use(params);
  const [selectedDate, setSelectedDate] = useState(todayIso);

  const { data: stats, isLoading: statsLoading } = useStoreDashboardStats(storeId, selectedDate);
  const { data: recent = [], isLoading: txLoading } = useStoreRecentTransactions(storeId, selectedDate);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.date}>{formatDateLabel(selectedDate)}</p>
        </div>
        <input
          type="date"
          className={styles.datePicker}
          value={selectedDate}
          max={todayIso()}
          onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
          aria-label="Select date"
        />
      </div>

      {/* ── KPI ──────────────────────────────────────────────────── */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Sales Today</span>
            <div className={styles.kpiIcon} aria-hidden="true">
              <TrendingUp size={18} strokeWidth={2} />
            </div>
          </div>

          {statsLoading ? (
            <div className={styles.kpiSkeleton} aria-busy="true" />
          ) : (
            <p className={styles.kpiValue}>
              {formatPeso(stats?.todaySales ?? 0)}
            </p>
          )}

          <p className={styles.kpiSub}>
            {statsLoading
              ? " "
              : `${stats?.todayTransactions ?? 0} ${
                  stats?.todayTransactions === 1 ? "transaction" : "transactions"
                }`}
          </p>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>GCash Profit Today</span>
            <div className={styles.kpiIcon} aria-hidden="true">
              <Wallet size={18} strokeWidth={2} />
            </div>
          </div>

          {statsLoading ? (
            <div className={styles.kpiSkeleton} aria-busy="true" />
          ) : (
            <p className={styles.kpiValue}>
              {formatPeso(stats?.todayGcashProfit ?? 0)}
            </p>
          )}

          <p className={styles.kpiSub}>
            {statsLoading
              ? " "
              : `${stats?.todayGcashServices ?? 0} ${
                  stats?.todayGcashServices === 1 ? "service" : "services"
                }`}
          </p>
        </div>
      </div>

      {/* ── Recent transactions ───────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Transactions</h2>
          <CreditCard size={16} strokeWidth={1.75} className={styles.sectionIcon} aria-hidden="true" />
        </div>

        {txLoading ? (
          <ul className={styles.txList} aria-busy="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className={styles.txSkeleton} />
            ))}
          </ul>
        ) : recent.length === 0 ? (
          <p className={styles.empty}>No transactions yet today.</p>
        ) : (
          <ul className={styles.txList}>
            {recent.map((tx) => (
              <TxRow key={tx.id} tx={tx} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
