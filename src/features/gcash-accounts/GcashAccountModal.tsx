"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  useCreateGcashAccount,
  useUpdateGcashAccount,
  type GcashAccountFull,
} from "@/shared/queries/gcash";
import styles from "./GcashAccountModal.module.css";

interface GcashAccountModalProps {
  storeId: string;
  open: boolean;
  editing: GcashAccountFull | null;
  onClose: () => void;
}

interface FormValues {
  name: string;
  number: string;
  initialBalance: string;
  is_active: boolean;
}

export function GcashAccountModal({ storeId, open, editing, onClose }: GcashAccountModalProps) {
  const { mutate: create, isPending: creating } = useCreateGcashAccount();
  const { mutate: update, isPending: updating } = useUpdateGcashAccount();
  const isPending = creating || updating;

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
          ? { name: editing.name, number: editing.number, is_active: editing.is_active, initialBalance: "" }
          : { name: "", number: "", initialBalance: "0", is_active: true }
      );
    }
  }, [open, editing]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;

  const onSubmit = (values: FormValues) => {
    if (editing) {
      update(
        { id: editing.id, storeId, name: values.name.trim(), number: values.number.trim(), is_active: values.is_active },
        { onSuccess: onClose }
      );
    } else {
      create(
        { storeId, name: values.name.trim(), number: values.number.trim(), initialBalance: parseFloat(values.initialBalance) || 0 },
        { onSuccess: onClose }
      );
    }
  };

  return (
    <div className={styles.backdrop}>
      <div
        role="dialog"
        aria-modal="true"
        className={styles.dialog}
        aria-labelledby="gcash-account-modal-title"
      >
        <h2 id="gcash-account-modal-title" className={styles.title}>
          {editing ? "Edit GCash account" : "Add GCash account"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form} autoComplete="off">
          <div className={styles.field}>
            <label htmlFor="ga-name" className={styles.label}>
              Label <span className={styles.required} aria-hidden="true">*</span>
            </label>
            <input
              id="ga-name"
              type="text"
              placeholder="e.g. Main GCash"
              className={`${styles.input}${errors.name ? ` ${styles.inputError}` : ""}`}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "ga-name-error" : undefined}
              {...register("name", { required: "Label is required." })}
            />
            {errors.name && (
              <span id="ga-name-error" className={styles.error} role="alert">{errors.name.message}</span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="ga-number" className={styles.label}>
              GCash number <span className={styles.required} aria-hidden="true">*</span>
            </label>
            <input
              id="ga-number"
              type="tel"
              inputMode="numeric"
              placeholder="09XXXXXXXXX"
              className={`${styles.input}${errors.number ? ` ${styles.inputError}` : ""}`}
              aria-invalid={!!errors.number}
              aria-describedby={errors.number ? "ga-number-error" : undefined}
              {...register("number", {
                required: "GCash number is required.",
                pattern: { value: /^09\d{9}$/, message: "Enter a valid 11-digit mobile number." },
              })}
            />
            {errors.number && (
              <span id="ga-number-error" className={styles.error} role="alert">{errors.number.message}</span>
            )}
          </div>

          {!editing && (
            <div className={styles.field}>
              <label htmlFor="ga-balance" className={styles.label}>
                Current balance (₱){" "}
                <span className={styles.labelHint}>(optional — set if account already has funds)</span>
              </label>
              <input
                id="ga-balance"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="0.00"
                className={`${styles.input}${errors.initialBalance ? ` ${styles.inputError}` : ""}`}
                aria-invalid={!!errors.initialBalance}
                aria-describedby={errors.initialBalance ? "ga-balance-error" : undefined}
                {...register("initialBalance", {
                  min: { value: 0, message: "Cannot be negative." },
                })}
              />
              {errors.initialBalance && (
                <span id="ga-balance-error" className={styles.error} role="alert">{errors.initialBalance.message}</span>
              )}
            </div>
          )}

          {editing && (
            <label className={styles.checkboxRow}>
              <input type="checkbox" className={styles.checkbox} {...register("is_active")} />
              <span className={styles.checkboxLabel}>Active</span>
            </label>
          )}

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.saveBtn} disabled={isPending}>
              {isPending ? "Saving…" : editing ? "Save changes" : "Add account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
