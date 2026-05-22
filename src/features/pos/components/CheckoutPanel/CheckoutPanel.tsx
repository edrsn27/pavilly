"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { ChevronLeft } from "lucide-react";
import { useCreateTransaction } from "@/shared/queries/transactions";
import type { CartItem, PaymentMethod } from "../../PosTerminal.types";
import styles from "./CheckoutPanel.module.css";

interface CheckoutPanelProps {
  storeId: string;
  items: CartItem[];
  total: number;
  onBack: () => void;
  onSuccess: () => void;
}

interface FormValues {
  paymentMethod: PaymentMethod | "";
  amountTendered: string;
  notes: string;
}

const formatPeso = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "gcash", label: "GCash" },
  { value: "maya", label: "Maya" },
  { value: "card", label: "Card" },
];

export function CheckoutPanel({
  storeId,
  items,
  total,
  onBack,
  onSuccess,
}: CheckoutPanelProps) {
  const { mutate: createTransaction, isPending } = useCreateTransaction();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    mode: "onTouched",
    defaultValues: {
      paymentMethod: "",
      amountTendered: "",
      notes: "",
    },
  });

  const paymentMethod = watch("paymentMethod");
  const amountTenderedStr = watch("amountTendered");
  const isCash = paymentMethod === "cash";
  const amountTendered = isCash ? parseFloat(amountTenderedStr) : null;
  const change =
    isCash && !isNaN(amountTendered!) ? amountTendered! - total : null;
  const insufficientCash = isCash && (isNaN(amountTendered!) || amountTendered! < total);

  const isConfirmDisabled =
    !paymentMethod || isPending || (isCash && insufficientCash);

  const onSubmit = (values: FormValues) => {
    setServerError(null);

    const transactionItems = items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      costPrice: item.costPrice,
      sellingPrice: item.unitPrice,
      quantity: item.quantity,
      subtotal: item.unitPrice * item.quantity,
    }));

    createTransaction(
      {
        storeId,
        paymentMethod: values.paymentMethod as PaymentMethod,
        amountTendered: isCash ? amountTendered : null,
        change: isCash && change !== null ? change : null,
        notes: values.notes.trim() || undefined,
        items: transactionItems,
      },
      {
        onSuccess: () => {
          setSuccess(true);
          setTimeout(() => {
            setSuccess(false);
            onSuccess();
          }, 1200);
        },
        onError: (err) => {
          setServerError(
            err instanceof Error ? err.message : "Failed to complete sale."
          );
        },
      }
    );
  };

  if (success) {
    return (
      <div className={styles.successState}>
        <div className={styles.successIcon} aria-hidden="true">✓</div>
        <p className={styles.successText}>Sale complete!</p>
        <p className={styles.successAmount}>{formatPeso(total)}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={onBack}
          aria-label="Back to cart"
        >
          <ChevronLeft size={18} aria-hidden="true" />
          Back
        </button>
        <h2 className={styles.title}>Checkout</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.summary}>
          <div className={styles.summaryItems}>
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.priceType}-${item.unitPrice}`}
                className={styles.summaryItem}
              >
                <span className={styles.summaryItemName}>
                  {item.productName}
                  <span className={styles.summaryItemQty}> × {item.quantity}</span>
                </span>
                <span className={styles.summaryItemSubtotal}>
                  {formatPeso(item.unitPrice * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className={styles.summaryTotal}>
            <span className={styles.summaryTotalLabel}>Total</span>
            <span className={styles.summaryTotalAmount}>{formatPeso(total)}</span>
          </div>
        </div>

        {serverError && (
          <div className={styles.errorBanner} role="alert">
            {serverError}
          </div>
        )}

        <div className={styles.section}>
          <p className={styles.sectionLabel}>Payment method</p>
          <Controller
            name="paymentMethod"
            control={control}
            rules={{ required: "Select a payment method" }}
            render={({ field }) => (
              <div className={styles.paymentGrid}>
                {PAYMENT_METHODS.map((pm) => (
                  <button
                    key={pm.value}
                    type="button"
                    className={`${styles.paymentBtn}${field.value === pm.value ? ` ${styles.paymentBtnActive}` : ""}`}
                    onClick={() => field.onChange(pm.value)}
                  >
                    {pm.label}
                  </button>
                ))}
              </div>
            )}
          />
          {errors.paymentMethod && (
            <span className={styles.fieldError} role="alert">
              {errors.paymentMethod.message}
            </span>
          )}
        </div>

        {isCash && (
          <div className={styles.section}>
            <div className={styles.field}>
              <label htmlFor="amount-tendered" className={styles.fieldLabel}>
                Amount tendered (₱)
              </label>
              <input
                id="amount-tendered"
                type="number"
                min={total}
                step="0.01"
                placeholder={total.toFixed(2)}
                className={styles.input}
                aria-describedby={
                  errors.amountTendered ? "tendered-error" : undefined
                }
                {...register("amountTendered", {
                  required: isCash ? "Enter amount tendered" : false,
                  min: {
                    value: total,
                    message: `Minimum is ${formatPeso(total)}`,
                  },
                })}
              />
              {errors.amountTendered && (
                <span id="tendered-error" className={styles.fieldError} role="alert">
                  {errors.amountTendered.message}
                </span>
              )}
            </div>

            {change !== null && (
              <div
                className={`${styles.changeLine}${change < 0 ? ` ${styles.changeNegative}` : ""}`}
              >
                <span>Change</span>
                <span className={styles.changeAmount}>
                  {change < 0 ? "−" : ""}{formatPeso(Math.abs(change))}
                </span>
              </div>
            )}
          </div>
        )}

        <div className={styles.section}>
          <div className={styles.field}>
            <label htmlFor="checkout-notes" className={styles.fieldLabel}>
              Notes{" "}
              <span className={styles.fieldLabelHint}>(optional)</span>
            </label>
            <input
              id="checkout-notes"
              type="text"
              placeholder="e.g. Customer request"
              className={styles.input}
              {...register("notes")}
            />
          </div>
        </div>

        <div className={styles.formFooter}>
          <button
            type="submit"
            className={styles.confirmBtn}
            disabled={isConfirmDisabled}
          >
            {isPending ? "Processing…" : "Confirm sale"}
          </button>
        </div>
      </form>
    </div>
  );
}
