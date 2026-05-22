"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { useCategories } from "@/shared/queries/categories";
import { useCreateProduct, useUpdateProduct } from "@/shared/queries/products";
import type { Product } from "@/shared/queries/products";
import styles from "./ProductModal.module.css";

interface ProductFields {
  name: string;
  description: string;
  category_id: string;
  price_type: "fixed" | "variable";
  cost_price: string;
  selling_price: string;
  is_active: boolean;
}

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  storeId: string;
  product?: Product;
}

export function ProductModal({ open, onClose, storeId, product }: ProductModalProps) {
  const isUpdate = !!product;
  const { data: categories } = useCategories(storeId);
  const { mutate: createProduct, isPending: creating } = useCreateProduct();
  const { mutate: updateProduct, isPending: updating } = useUpdateProduct();
  const isPending = creating || updating;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors },
  } = useForm<ProductFields>({ mode: "onTouched" });

  const priceType = watch("price_type");

  useEffect(() => {
    if (open) {
      reset({
        name: product?.name ?? "",
        description: product?.description ?? "",
        category_id: product?.category_id ?? "",
        price_type: product?.price_type ?? "fixed",
        cost_price: product?.cost_price != null ? String(product.cost_price) : "",
        selling_price: product?.selling_price != null ? String(product.selling_price) : "",
        is_active: product?.is_active ?? true,
      });
    }
  }, [open, product, reset]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const onSubmit = (data: ProductFields) => {
    const payload = {
      name: data.name.trim(),
      description: data.description.trim() || undefined,
      category_id: data.category_id || undefined,
      price_type: data.price_type,
      cost_price: data.cost_price ? parseFloat(data.cost_price) : undefined,
      selling_price:
        data.price_type === "fixed" && data.selling_price
          ? parseFloat(data.selling_price)
          : undefined,
      is_active: data.is_active,
    };

    if (isUpdate) {
      updateProduct(
        { id: product.id, store_id: storeId, ...payload },
        {
          onSuccess: onClose,
          onError: (err) =>
            setError("root", {
              message: err instanceof Error ? err.message : "Failed to update product.",
            }),
        }
      );
    } else {
      createProduct(
        { store_id: storeId, ...payload },
        {
          onSuccess: onClose,
          onError: (err) =>
            setError("root", {
              message: err instanceof Error ? err.message : "Failed to create product.",
            }),
        }
      );
    }
  };

  return (
    <div className={styles.backdrop}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
      >
        {/* Header */}
        <div className={styles.header}>
          <h2 id="product-modal-title" className={styles.title}>
            {isUpdate ? "Edit product" : "Add product"}
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={styles.body}>

            {errors.root && (
              <div className={styles.errorBanner} role="alert">
                {errors.root.message}
              </div>
            )}

            {/* Name */}
            <div className={styles.field}>
              <label htmlFor="product-name" className={styles.label}>
                Product name <span className={styles.required} aria-hidden="true">*</span>
              </label>
              <input
                id="product-name"
                type="text"
                autoFocus
                placeholder="e.g. Coca-Cola 1.5L"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "product-name-error" : undefined}
                className={`${styles.input}${errors.name ? ` ${styles.inputError}` : ""}`}
                {...register("name", { required: "Product name is required." })}
              />
              {errors.name && (
                <span id="product-name-error" className={styles.fieldError} role="alert">
                  {errors.name.message}
                </span>
              )}
            </div>

            {/* Description */}
            <div className={styles.field}>
              <label htmlFor="product-desc" className={styles.label}>
                Description <span className={styles.labelHint}>(optional)</span>
              </label>
              <textarea
                id="product-desc"
                rows={2}
                placeholder="Short description…"
                className={styles.textarea}
                {...register("description")}
              />
            </div>

            {/* Category */}
            <div className={styles.field}>
              <label htmlFor="product-category" className={styles.label}>
                Category <span className={styles.labelHint}>(optional)</span>
              </label>
              <select
                id="product-category"
                className={styles.select}
                {...register("category_id")}
              >
                <option value="">No category</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

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
                <label htmlFor="product-cost" className={styles.label}>
                  Cost price <span className={styles.labelHint}>(optional)</span>
                </label>
                <div className={styles.inputPrefix}>
                  <span className={styles.prefix}>₱</span>
                  <input
                    id="product-cost"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className={styles.inputWithPrefix}
                    {...register("cost_price", {
                      min: { value: 0, message: "Must be ≥ 0" },
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
                  <label htmlFor="product-price" className={styles.label}>
                    Selling price <span className={styles.required} aria-hidden="true">*</span>
                  </label>
                  <div className={styles.inputPrefix}>
                    <span className={styles.prefix}>₱</span>
                    <input
                      id="product-price"
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

            {/* Active toggle (edit only) */}
            {isUpdate && (
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
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={isPending}>
              {isPending
                ? isUpdate ? "Saving…" : "Adding…"
                : isUpdate ? "Save changes" : "Add product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
