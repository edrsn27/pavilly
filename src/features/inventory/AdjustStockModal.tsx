"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useAdjustStock } from "@/shared/queries/inventory";
import type { InventoryItem } from "@/shared/queries/inventory";
import styles from "./AdjustStockModal.module.css";

interface AdjustStockModalProps {
  open: boolean;
  onClose: () => void;
  storeId: string;
  item: InventoryItem;
}

export function AdjustStockModal({ open, onClose, storeId, item }: AdjustStockModalProps) {
  const { mutate: adjust, isPending } = useAdjustStock();
  const [mode, setMode] = useState<"add" | "set">("add");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setMode("add");
      setAmount("");
      setNotes("");
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const parsedAmount = parseInt(amount, 10);
  const newStock = !isNaN(parsedAmount)
    ? mode === "add" ? item.stock + parsedAmount : parsedAmount
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isNaN(parsedAmount) || parsedAmount < 0) {
      setError("Enter a valid amount (0 or more).");
      return;
    }
    if (mode === "add" && parsedAmount === 0) {
      setError("Amount must be greater than 0.");
      return;
    }

    adjust(
      { storeId, inventoryId: item.inventoryId, productId: item.productId, currentStock: item.stock, mode, amount: parsedAmount, notes },
      {
        onSuccess: onClose,
        onError: (err) => setError(err instanceof Error ? err.message : "Failed to adjust stock."),
      }
    );
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="adjust-modal-title">

        <div className={styles.header}>
          <h2 id="adjust-modal-title" className={styles.title}>Adjust stock</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.body}>

            <div className={styles.productInfo}>
              <span className={styles.productName}>{item.productName}</span>
              <span className={styles.currentStock}>
                Current stock: <strong>{item.stock}</strong>
              </span>
            </div>

            {error && (
              <div className={styles.errorBanner} role="alert">{error}</div>
            )}

            {/* Mode toggle */}
            <div className={styles.modeGroup}>
              <button
                type="button"
                className={`${styles.modeBtn}${mode === "add" ? ` ${styles.modeBtnActive}` : ""}`}
                onClick={() => setMode("add")}
              >
                Add stock
              </button>
              <button
                type="button"
                className={`${styles.modeBtn}${mode === "set" ? ` ${styles.modeBtnActive}` : ""}`}
                onClick={() => setMode("set")}
              >
                Set to
              </button>
            </div>

            {/* Amount */}
            <div className={styles.field}>
              <label htmlFor="adjust-amount" className={styles.label}>
                {mode === "add" ? "Quantity to add" : "New stock level"}
              </label>
              <input
                id="adjust-amount"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                autoFocus
                className={styles.input}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              {newStock !== null && (
                <span className={styles.preview}>
                  New total: <strong>{newStock}</strong>
                </span>
              )}
            </div>

            {/* Notes */}
            <div className={styles.field}>
              <label htmlFor="adjust-notes" className={styles.label}>
                Notes <span className={styles.labelHint}>(optional)</span>
              </label>
              <input
                id="adjust-notes"
                type="text"
                placeholder="e.g. Delivery from supplier"
                className={styles.input}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.submitBtn} disabled={isPending || !amount}>
              {isPending ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
