"use client";

import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { PackageX } from "lucide-react";
import { useAdjustStock } from "@/shared/queries/inventory";
import type { Product } from "@/shared/queries/products";
import styles from "./OutOfStockModal.module.css";

interface FormValues {
  amount: string;
}

interface OutOfStockModalProps {
  product: Product;
  storeId: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function OutOfStockModal({ product, storeId, onSuccess, onClose }: OutOfStockModalProps) {
  const { mutate: adjustStock, isPending } = useAdjustStock();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    mode: "onTouched",
    defaultValues: { amount: "1" },
  });

  const inventoryId = product.inventory?.id;

  const onSubmit = (data: FormValues) => {
    if (!inventoryId) return;
    setServerError(null);

    adjustStock(
      {
        storeId,
        inventoryId,
        productId: product.id,
        currentStock: 0,
        mode: "add",
        amount: Math.max(1, parseInt(data.amount, 10) || 1),
        notes: "Restocked at POS",
      },
      {
        onSuccess,
        onError: (err) =>
          setServerError(err instanceof Error ? err.message : "Failed to update stock."),
      }
    );
  };

  return createPortal(
    <div className={styles.backdrop}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="oos-modal-title"
      >
        <div className={styles.header}>
          <span className={styles.icon} aria-hidden="true">
            <PackageX size={22} />
          </span>
          <div>
            <h2 id="oos-modal-title" className={styles.title}>Out of stock</h2>
            <p className={styles.description}>
              <strong>{product.name}</strong> has no stock. Add units to continue.
            </p>
          </div>
        </div>

        {serverError && (
          <div className={styles.errorBanner} role="alert">{serverError}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.body}>
            <div className={styles.field}>
              <label htmlFor="oos-amount" className={styles.label}>
                Units to add <span className={styles.required} aria-hidden="true">*</span>
              </label>
              <input
                id="oos-amount"
                type="number"
                min="1"
                step="1"
                autoFocus
                className={`${styles.input}${errors.amount ? ` ${styles.inputError}` : ""}`}
                aria-invalid={!!errors.amount}
                aria-describedby={errors.amount ? "oos-amount-error" : undefined}
                {...register("amount", {
                  required: "Enter how many units to add.",
                  min: { value: 1, message: "At least 1 unit required." },
                  pattern: { value: /^\d+$/, message: "Whole numbers only." },
                })}
              />
              {errors.amount && (
                <span id="oos-amount-error" className={styles.fieldError} role="alert">
                  {errors.amount.message}
                </span>
              )}
            </div>
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isPending || !inventoryId}
            >
              {isPending ? "Updating…" : "Add stock & add to order"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
