"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Store, ArrowRight } from "lucide-react";
import { routes } from "@/navigation/routes";
import { useMyStores } from "@/shared/queries/stores";
import { StoreModal } from "@/features/store";
import type { Store as StoreType } from "@/shared/queries/stores";
import styles from "./dashboard.module.css";

const today = new Intl.DateTimeFormat("en-PH", {
  weekday: "long",
  month: "long",
  day: "numeric",
}).format(new Date());

function StoreCard({ store, onEdit }: { store: StoreType; onEdit: () => void }) {
  return (
    <div className={styles.storeCard}>
      <div className={styles.storeCardHeader}>
        <div className={styles.storeCardIcon}>
          <Store size={20} strokeWidth={1.5} aria-hidden="true" />
        </div>
        <button
          type="button"
          className={styles.storeCardEditBtn}
          onClick={onEdit}
        >
          Edit
        </button>
      </div>
      <h2 className={styles.storeCardName}>{store.name}</h2>
      {store.description && (
        <p className={styles.storeCardDesc}>{store.description}</p>
      )}
      <Link
        href={routes.store.pos(store.id)}
        className={styles.storeCardLink}
      >
        Open store
        <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
      </Link>
    </div>
  );
}

export default function DashboardPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreType | undefined>();
  const { data: stores, isLoading } = useMyStores();

  function openCreate() {
    setEditingStore(undefined);
    setModalOpen(true);
  }

  function openEdit(store: StoreType) {
    setEditingStore(store);
    setModalOpen(true);
  }

  function handleClose() {
    setModalOpen(false);
    setEditingStore(undefined);
  }

  return (
    <div className={styles.page}>

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.pageDate}>{today}</p>
        </div>
        <button
          type="button"
          className={styles.addStoreBtn}
          onClick={openCreate}
        >
          <Plus size={16} strokeWidth={2.5} aria-hidden="true" />
          Add store
        </button>
      </div>

      {modalOpen && (
        <StoreModal
          key={editingStore?.id ?? "create"}
          onClose={handleClose}
          store={editingStore}
        />
      )}

      {isLoading ? (
        <div className={styles.loading}>Loading…</div>
      ) : !stores?.length ? (
        <div className={styles.noStore}>
          <div className={styles.noStoreIcon}>
            <Store size={40} strokeWidth={1.5} aria-hidden="true" />
          </div>
          <h2 className={styles.noStoreTitle}>Set up your first store</h2>
          <p className={styles.noStoreSub}>
            Create a store to start adding products, managing inventory, and processing sales.
          </p>
          <button
            type="button"
            className={styles.noStoreBtn}
            onClick={openCreate}
          >
            Create store
          </button>
        </div>
      ) : (
        <div className={styles.storeGrid}>
          {stores.map((store) => (
            <StoreCard key={store.id} store={store} onEdit={() => openEdit(store)} />
          ))}
        </div>
      )}

    </div>
  );
}
