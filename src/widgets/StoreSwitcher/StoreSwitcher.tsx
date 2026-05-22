"use client";

import { useRef, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ChevronsUpDown, Check, Store } from "lucide-react";
import { useMyStores } from "@/shared/queries/stores";
import type { Store as StoreType } from "@/shared/queries/stores";
import styles from "./StoreSwitcher.module.css";

export function StoreSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentStoreId = typeof params.id === "string" ? params.id : undefined;

  const { data: stores } = useMyStores();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentStore = stores?.find((s) => s.id === currentStoreId);

  function switchStore(store: StoreType) {
    if (store.id === currentStoreId) {
      setOpen(false);
      return;
    }
    const newPath = pathname.replace(
      `/dashboard/store/${currentStoreId}`,
      `/dashboard/store/${store.id}`
    );
    router.push(newPath);
    setOpen(false);
  }

  if (!currentStore) return null;

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={styles.triggerIcon}>
          <Store size={14} strokeWidth={1.75} aria-hidden="true" />
        </span>
        <span className={styles.triggerLabel}>{currentStore.name}</span>
        <ChevronsUpDown size={14} strokeWidth={1.75} className={styles.chevron} aria-hidden="true" />
      </button>

      {open && (
        <>
          <div className={styles.backdrop} onClick={() => setOpen(false)} />
          <ul className={styles.dropdown} role="listbox" aria-label="Switch store">
            {stores?.map((store) => {
              const active = store.id === currentStoreId;
              return (
                <li
                  key={store.id}
                  role="option"
                  aria-selected={active}
                  className={`${styles.option}${active ? ` ${styles.optionActive}` : ""}`}
                  onClick={() => switchStore(store)}
                >
                  <span className={styles.optionName}>{store.name}</span>
                  {active && (
                    <Check size={14} strokeWidth={2.5} className={styles.optionCheck} aria-hidden="true" />
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
