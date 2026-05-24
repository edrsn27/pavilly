"use client";

import { useForm } from "react-hook-form";
import { useCategories } from "@/shared/queries/categories";
import type { ProductFormValues } from "./ProductForm.types";
import styles from "./ProductForm.module.css";

const MARGIN = 0.20;

interface ProductFormProps {
  storeId: string;
  defaultValues?: Partial<ProductFormValues>;
  onSubmit: (values: ProductFormValues) => void;
  onCancel: () => void;
  isPending: boolean;
  serverError?: string | null;
  submitLabel?: string;
  showDescription?: boolean;
  showBarcode?: boolean;
  showCategory?: boolean;
  showIsActive?: boolean;
  autoFocus?: boolean;
}

export function ProductForm({
  storeId,
  defaultValues,
  onSubmit,
  onCancel,
  isPending,
  serverError,
  submitLabel = "Save",
  showDescription = true,
  showBarcode = true,
  showCategory = true,
  showIsActive = false,
  autoFocus = true,
}: ProductFormProps) {
  const { data: categories } = useCategories(storeId);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, touchedFields },
  } = useForm<ProductFormValues>({
    mode: "onTouched",
    defaultValues: {
      name: "",
      description: "",
      barcode: "",
      category_id: "",
      price_type: "fixed",
      cost_price: "",
      selling_price: "",
      stock: "0",
      is_active: true,
      ...defaultValues,
    },
  });

  const priceType = watch("price_type");

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className={styles.body}>

        {serverError && (
          <div className={styles.errorBanner} role="alert">{serverError}</div>
        )}

        {/* Name */}
        <div className={styles.field}>
          <label htmlFor="pf-name" className={styles.label}>
            Product name <span className={styles.required} aria-hidden="true">*</span>
          </label>
          <input
            id="pf-name"
            type="text"
            autoFocus={autoFocus}
            placeholder="e.g. Coca-Cola 1.5L"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "pf-name-error" : undefined}
            className={`${styles.input}${errors.name ? ` ${styles.inputError}` : ""}`}
            {...register("name", { required: "Product name is required." })}
          />
          {errors.name && (
            <span id="pf-name-error" className={styles.fieldError} role="alert">
              {errors.name.message}
            </span>
          )}
        </div>

        {/* Description */}
        {showDescription && (
          <div className={styles.field}>
            <label htmlFor="pf-desc" className={styles.label}>
              Description <span className={styles.labelHint}>(optional)</span>
            </label>
            <textarea
              id="pf-desc"
              rows={2}
              placeholder="Short description…"
              className={styles.textarea}
              {...register("description")}
            />
          </div>
        )}

        {/* Barcode */}
        {showBarcode && (
          <div className={styles.field}>
            <label htmlFor="pf-barcode" className={styles.label}>
              Barcode <span className={styles.labelHint}>(optional)</span>
            </label>
            <input
              id="pf-barcode"
              type="text"
              inputMode="numeric"
              placeholder="e.g. 4800024520375"
              aria-invalid={!!errors.barcode}
              aria-describedby={errors.barcode ? "pf-barcode-error" : undefined}
              className={`${styles.input}${errors.barcode ? ` ${styles.inputError}` : ""}`}
              {...register("barcode", {
                validate: (v) =>
                  !v || /^\d+$/.test(v.trim()) || "Barcode must contain digits only.",
              })}
            />
            {errors.barcode && (
              <span id="pf-barcode-error" className={styles.fieldError} role="alert">
                {errors.barcode.message}
              </span>
            )}
          </div>
        )}

        {/* Category */}
        {showCategory && (
          <div className={styles.field}>
            <label htmlFor="pf-category" className={styles.label}>
              Category <span className={styles.labelHint}>(optional)</span>
            </label>
            <select
              id="pf-category"
              className={styles.select}
              {...register("category_id")}
            >
              <option value="">No category</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Price type */}
        <div className={styles.field}>
          <span className={styles.label}>Price type</span>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                value="fixed"
                className={styles.radioInput}
                {...register("price_type")}
              />
              <span className={styles.radioText}>
                <strong>Fixed</strong>
                <span className={styles.radioHint}>Set selling price per unit</span>
              </span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                value="variable"
                className={styles.radioInput}
                {...register("price_type")}
              />
              <span className={styles.radioText}>
                <strong>Variable</strong>
                <span className={styles.radioHint}>Cashier enters price at POS</span>
              </span>
            </label>
          </div>
        </div>

        {/* Prices */}
        <div className={styles.priceRow}>
          <div className={styles.field}>
            <label htmlFor="pf-cost" className={styles.label}>
              Cost price <span className={styles.labelHint}>(optional)</span>
            </label>
            <div className={styles.inputPrefix}>
              <span className={styles.prefix}>₱</span>
              <input
                id="pf-cost"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className={styles.inputWithPrefix}
                {...register("cost_price", {
                  min: { value: 0, message: "Must be ≥ 0" },
                  onChange: (e) => {
                    if (touchedFields.selling_price) return;
                    const cost = parseFloat(e.target.value);
                    if (!isNaN(cost) && cost > 0) {
                      setValue("selling_price", (cost / (1 - MARGIN)).toFixed(2));
                    }
                  },
                })}
              />
            </div>
            {errors.cost_price && (
              <span className={styles.fieldError} role="alert">
                {errors.cost_price.message}
              </span>
            )}
          </div>

          {priceType === "fixed" && (
            <div className={styles.field}>
              <label htmlFor="pf-price" className={styles.label}>
                Selling price <span className={styles.required} aria-hidden="true">*</span>
              </label>
              <div className={styles.inputPrefix}>
                <span className={styles.prefix}>₱</span>
                <input
                  id="pf-price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  aria-invalid={!!errors.selling_price}
                  className={`${styles.inputWithPrefix}${errors.selling_price ? ` ${styles.inputError}` : ""}`}
                  {...register("selling_price", {
                    required:
                      priceType === "fixed"
                        ? "Selling price is required for fixed products."
                        : false,
                    min: { value: 0, message: "Must be ≥ 0" },
                    onChange: (e) => {
                      if (touchedFields.cost_price) return;
                      const selling = parseFloat(e.target.value);
                      if (!isNaN(selling) && selling > 0) {
                        setValue("cost_price", (selling * (1 - MARGIN)).toFixed(2));
                      }
                    },
                  })}
                />
              </div>
              {errors.selling_price && (
                <span className={styles.fieldError} role="alert">
                  {errors.selling_price.message}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Stock (fixed products only) */}
        {priceType === "fixed" && (
          <div className={styles.field}>
            <label htmlFor="pf-stock" className={styles.label}>
              Stock <span className={styles.labelHint}>(units on hand)</span>
            </label>
            <input
              id="pf-stock"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              aria-invalid={!!errors.stock}
              aria-describedby={errors.stock ? "pf-stock-error" : undefined}
              className={`${styles.input}${errors.stock ? ` ${styles.inputError}` : ""}`}
              {...register("stock", {
                min: { value: 0, message: "Stock must be ≥ 0" },
                pattern: { value: /^\d*$/, message: "Whole numbers only" },
              })}
            />
            {errors.stock && (
              <span id="pf-stock-error" className={styles.fieldError} role="alert">
                {errors.stock.message}
              </span>
            )}
          </div>
        )}

        {/* Active toggle */}
        {showIsActive && (
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              className={styles.checkbox}
              {...register("is_active")}
            />
            <span className={styles.checkboxText}>Active (visible in POS)</span>
          </label>
        )}

      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <button type="button" className={styles.cancelBtn} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className={styles.submitBtn} disabled={isPending}>
          {isPending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
