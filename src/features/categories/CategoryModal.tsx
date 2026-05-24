"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Category } from "@/shared/queries/categories";
import styles from "./CategoryModal.module.css";

interface FormValues {
  name: string;
  sort_order: number;
}

interface CategoryModalProps {
  open: boolean;
  editing: Category | null;
  nextSortOrder: number;
  onSave: (values: FormValues) => void;
  onClose: () => void;
  isPending: boolean;
}

export function CategoryModal({
  open,
  editing,
  nextSortOrder,
  onSave,
  onClose,
  isPending,
}: CategoryModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ mode: "onTouched" });

  useEffect(() => {
    if (open) {
      reset(
        editing
          ? { name: editing.name, sort_order: editing.sort_order }
          : { name: "", sort_order: nextSortOrder }
      );
    }
    // Only reset when the modal opens or the editing target changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing]);

  if (!open) return null;

  return (
    <div className={styles.backdrop}>
      <div
        role="dialog"
        aria-modal="true"
        className={styles.dialog}
        aria-label={editing ? "Edit category" : "Add category"}
      >
        <h2 className={styles.title}>
          {editing ? "Edit category" : "Add category"}
        </h2>
        <form onSubmit={handleSubmit(onSave)} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="cat-name" className={styles.label}>
              Name
            </label>
            <input
              id="cat-name"
              type="text"
              className={styles.input}
              autoFocus
              autoComplete="off"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <span className={styles.error} role="alert">
                {errors.name.message}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="cat-order" className={styles.label}>
              Sort order <span className={styles.required} aria-hidden="true">*</span>
            </label>
            <input
              id="cat-order"
              type="number"
              min={0}
              aria-invalid={!!errors.sort_order}
              aria-describedby={errors.sort_order ? "cat-order-error" : undefined}
              className={`${styles.input}${errors.sort_order ? ` ${styles.inputError}` : ""}`}
              {...register("sort_order", {
                required: "Sort order is required.",
                valueAsNumber: true,
                min: { value: 0, message: "Must be ≥ 0" },
              })}
            />
            {errors.sort_order && (
              <span id="cat-order-error" className={styles.error} role="alert">
                {errors.sort_order.message}
              </span>
            )}
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.saveBtn} disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
