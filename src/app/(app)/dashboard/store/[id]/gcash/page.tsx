"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { GcashServiceModal, type GcashServiceType } from "@/features/pos";
import styles from "./page.module.css";

export default function GcashServicesPage() {
  const { id: storeId } = useParams<{ id: string }>();
  const [modal, setModal] = useState<GcashServiceType | null>(null);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>GCash Services</h1>
      </div>

      <div className={styles.cards}>
        <button
          type="button"
          className={styles.card}
          onClick={() => setModal("gcash_in")}
        >
          <span className={styles.cardIcon} aria-hidden="true">
            <ArrowDownLeft size={28} />
          </span>
          <span className={styles.cardLabel}>Cash In</span>
          <span className={styles.cardDesc}>
            Customer gives cash — you load GCash to their number.
          </span>
        </button>

        <button
          type="button"
          className={styles.card}
          onClick={() => setModal("gcash_out")}
        >
          <span className={styles.cardIcon} aria-hidden="true">
            <ArrowUpRight size={28} />
          </span>
          <span className={styles.cardLabel}>Cash Out</span>
          <span className={styles.cardDesc}>
            Customer sends GCash — you give them cash.
          </span>
        </button>
      </div>

      <GcashServiceModal
        key={modal ?? "closed"}
        storeId={storeId}
        type={modal}
        onClose={() => setModal(null)}
      />
    </div>
  );
}
