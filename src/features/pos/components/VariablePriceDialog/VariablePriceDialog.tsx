"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import styles from "./VariablePriceDialog.module.css";

interface VariablePriceDialogProps {
  productName: string;
  open: boolean;
  onConfirm: (price: number) => void;
  onClose: () => void;
}

interface FormValues {
  price: number | undefined;
}

export function VariablePriceDialog({
  productName,
  open,
  onConfirm,
  onClose,
}: VariablePriceDialogProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ mode: "onTouched" });

  const priceValue = watch("price");

  useEffect(() => {
    if (open) reset({});
  }, [open, reset]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const onSubmit = (values: FormValues) => {
    onConfirm(values.price!);
  };

  const isDisabled = !priceValue || Number(priceValue) <= 0;

  return (
    <div className={styles.backdrop}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="variable-price-title"
      >
        <div className={styles.header}>
          <h2 id="variable-price-title" className={styles.title}>
            Enter price
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.body}>
            <p className={styles.productName}>{productName}</p>

            <div className={styles.field}>
              <label htmlFor="variable-price" className={styles.label}>
                Price (₱)
              </label>
              <input
                id="variable-price"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                autoFocus
                className={styles.input}
                aria-describedby={
                  errors.price ? "variable-price-error" : undefined
                }
                {...register("price", {
                  required: "Price is required",
                  min: { value: 0.01, message: "Price must be greater than 0" },
                  valueAsNumber: true,
                })}
              />
              {errors.price && (
                <span
                  id="variable-price-error"
                  className={styles.errorText}
                  role="alert"
                >
                  {errors.price.message}
                </span>
              )}
            </div>
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.confirmBtn}
              disabled={isDisabled}
            >
              Add to cart
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
