"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { useGcashAccounts, useCreateGcashTransaction } from "@/shared/queries/gcash";
import styles from "./GcashServiceModal.module.css";

export type GcashServiceType = "gcash_in" | "gcash_out";

interface GcashServiceModalProps {
  storeId: string;
  type: GcashServiceType | null;
  onClose: () => void;
}

interface FormValues {
  gcashAccountId: string;
  customerNumber: string;
  amount: string;
  referenceNumber: string;
  profit: string;
}

const FEE_BRACKET = 500;
const FEE_PER_BRACKET = 5;

function suggestServiceFee(amount: number): number {
  if (amount <= 0 || isNaN(amount)) return 0;
  return Math.ceil(amount / FEE_BRACKET) * FEE_PER_BRACKET;
}

const CONFIG = {
  gcash_in: {
    title: "GCash In",
    description: "Customer sends cash — you load GCash to their number.",
    confirmLabel: "Record GCash In",
  },
  gcash_out: {
    title: "GCash Out",
    description: "Customer sends GCash — you give them cash.",
    confirmLabel: "Record GCash Out",
  },
} as const;

export function GcashServiceModal({ storeId, type, onClose }: GcashServiceModalProps) {
  const { data: accounts = [] } = useGcashAccounts(storeId);
  const { mutate: createTx, isPending } = useCreateGcashTransaction();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, touchedFields },
  } = useForm<FormValues>({
    mode: "onTouched",
    defaultValues: {
      gcashAccountId: "",
      customerNumber: "",
      amount: "",
      referenceNumber: "",
      profit: "",
    },
  });

  useEffect(() => {
    if (accounts.length === 1) {
      setValue("gcashAccountId", accounts[0].id);
    }
  }, [accounts, setValue]);

  if (!type) return null;

  const cfg = CONFIG[type];

  const onSubmit = (values: FormValues) => {
    setServerError(null);
    createTx(
      {
        storeId,
        transactionType: type,
        gcashAccountId: values.gcashAccountId,
        customerNumber: values.customerNumber.trim() || undefined,
        amount: parseFloat(values.amount),
        referenceNumber: values.referenceNumber.trim() || undefined,
        profit: parseFloat(values.profit),
      },
      {
        onSuccess: () => {
          setSuccess(true);
          setTimeout(() => {
            setSuccess(false);
            onClose();
          }, 1200);
        },
        onError: (err) =>
          setServerError(err instanceof Error ? err.message : "Failed to record transaction."),
      }
    );
  };

  return createPortal(
    <div className={styles.backdrop}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gcash-modal-title"
      >
        {success ? (
          <div className={styles.successState}>
            <div className={styles.successIcon} aria-hidden="true">✓</div>
            <p className={styles.successText}>{cfg.title} recorded!</p>
          </div>
        ) : (
          <>
            <div className={styles.modalHeader}>
              <h2 id="gcash-modal-title" className={styles.title}>{cfg.title}</h2>
              <p className={styles.description}>{cfg.description}</p>
            </div>

            {serverError && (
              <div className={styles.errorBanner} role="alert">{serverError}</div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
              <div className={styles.body}>
                {accounts.length > 0 ? (
                  <div className={styles.field}>
                    <label htmlFor="gcash-account" className={styles.label}>
                      GCash account <span className={styles.required} aria-hidden="true">*</span>
                    </label>
                    <select
                      id="gcash-account"
                      className={`${styles.select}${errors.gcashAccountId ? ` ${styles.inputError}` : ""}`}
                      aria-invalid={!!errors.gcashAccountId}
                      aria-describedby={errors.gcashAccountId ? "gcash-account-error" : undefined}
                      {...register("gcashAccountId", { required: "Select a GCash account." })}
                    >
                      <option value="">— select account —</option>
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} · {a.number} · ₱{a.balance.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </option>
                      ))}
                    </select>
                    {errors.gcashAccountId && (
                      <span id="gcash-account-error" className={styles.fieldError} role="alert">
                        {errors.gcashAccountId.message}
                      </span>
                    )}
                  </div>
                ) : (
                  <p className={styles.noAccounts}>
                    No GCash accounts set up for this store. Add one in store settings.
                  </p>
                )}

                <div className={styles.field}>
                  <label htmlFor="customer-number" className={styles.label}>
                    Customer GCash number{" "}
                    <span className={styles.labelHint}>(optional)</span>
                  </label>
                  <input
                    id="customer-number"
                    type="tel"
                    inputMode="numeric"
                    placeholder="09XXXXXXXXX"
                    className={`${styles.input}${errors.customerNumber ? ` ${styles.inputError}` : ""}`}
                    aria-invalid={!!errors.customerNumber}
                    aria-describedby={errors.customerNumber ? "customer-number-error" : undefined}
                    {...register("customerNumber", {
                      validate: (v) =>
                        !v || /^09\d{9}$/.test(v) || "Enter a valid 11-digit mobile number.",
                    })}
                  />
                  {errors.customerNumber && (
                    <span id="customer-number-error" className={styles.fieldError} role="alert">
                      {errors.customerNumber.message}
                    </span>
                  )}
                </div>

                <div className={styles.row}>
                  <div className={styles.field}>
                    <label htmlFor="gcash-amount" className={styles.label}>
                      Amount (₱) <span className={styles.required} aria-hidden="true">*</span>
                    </label>
                    <input
                      id="gcash-amount"
                      type="number"
                      inputMode="decimal"
                      min="1"
                      step="0.01"
                      placeholder="0.00"
                      className={`${styles.input}${errors.amount ? ` ${styles.inputError}` : ""}`}
                      aria-invalid={!!errors.amount}
                      aria-describedby={errors.amount ? "gcash-amount-error" : undefined}
                      {...register("amount", {
                        validate: (v) => {
                          const n = parseFloat(v);
                          if (!v || isNaN(n)) return "Amount is required.";
                          if (n < 1) return "Amount must be at least ₱1.";
                          return true;
                        },
                        onChange: (e) => {
                          if (touchedFields.profit) return;
                          const fee = suggestServiceFee(parseFloat(e.target.value));
                          setValue("profit", fee > 0 ? String(fee) : "");
                        },
                      })}
                    />
                    {errors.amount && (
                      <span id="gcash-amount-error" className={styles.fieldError} role="alert">
                        {errors.amount.message}
                      </span>
                    )}
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="gcash-profit" className={styles.label}>
                      Service fee (₱) <span className={styles.required} aria-hidden="true">*</span>
                    </label>
                    <input
                      id="gcash-profit"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className={`${styles.input}${errors.profit ? ` ${styles.inputError}` : ""}`}
                      aria-invalid={!!errors.profit}
                      aria-describedby={errors.profit ? "gcash-profit-error" : undefined}
                      {...register("profit", {
                        validate: (v) => {
                          const n = parseFloat(v);
                          if (v === "" || v === undefined || isNaN(n)) return "Service fee is required.";
                          if (n < 0) return "Cannot be negative.";
                          return true;
                        },
                      })}
                    />
                    {errors.profit && (
                      <span id="gcash-profit-error" className={styles.fieldError} role="alert">
                        {errors.profit.message}
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.field}>
                  <label htmlFor="gcash-ref" className={styles.label}>
                    Reference number{" "}
                    <span className={styles.labelHint}>(optional)</span>
                  </label>
                  <input
                    id="gcash-ref"
                    type="text"
                    inputMode="numeric"
                    placeholder="GCash ref number"
                    className={styles.input}
                    {...register("referenceNumber")}
                  />
                </div>
              </div>

              <div className={styles.footer}>
                <button type="button" className={styles.cancelBtn} onClick={onClose}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.confirmBtn}
                  disabled={isPending || accounts.length === 0}
                >
                  {isPending ? "Recording…" : cfg.confirmLabel}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
