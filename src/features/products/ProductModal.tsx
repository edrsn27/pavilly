"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useCreateProduct, useUpdateProduct } from "@/shared/queries/products";
import type { Product } from "@/shared/queries/products";
import { ProductForm } from "@/shared/components/ProductForm";
import type { ProductFormValues } from "@/shared/components/ProductForm";
import styles from "./ProductModal.module.css";

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  storeId: string;
  product?: Product;
}

export function ProductModal({ open, onClose, storeId, product }: ProductModalProps) {
  const isUpdate = !!product;
  const { mutate: createProduct, isPending: creating } = useCreateProduct();
  const { mutate: updateProduct, isPending: updating } = useUpdateProduct();
  const isPending = creating || updating;
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const defaultValues: Partial<ProductFormValues> = {
    name: product?.name ?? "",
    description: product?.description ?? "",
    barcode: product?.barcode ?? "",
    category_id: product?.category_id ?? "",
    price_type: product?.price_type ?? "fixed",
    cost_price: product?.cost_price != null ? String(product.cost_price) : "",
    selling_price: product?.selling_price != null ? String(product.selling_price) : "",
    stock: product?.inventory?.stock != null ? String(product.inventory.stock) : "0",
    is_active: product?.is_active ?? true,
  };

  const handleSubmit = (data: ProductFormValues) => {
    setServerError(null);

    const stock =
      data.price_type === "fixed" && data.stock !== ""
        ? Math.max(0, parseInt(data.stock, 10) || 0)
        : undefined;

    const payload = {
      name: data.name.trim(),
      description: data.description.trim() || undefined,
      barcode: data.barcode.trim() || undefined,
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
        { id: product.id, store_id: storeId, stock, ...payload },
        {
          onSuccess: onClose,
          onError: (err) =>
            setServerError(err instanceof Error ? err.message : "Failed to update product."),
        }
      );
    } else {
      createProduct(
        { store_id: storeId, initialStock: stock, ...payload },
        {
          onSuccess: onClose,
          onError: (err) =>
            setServerError(err instanceof Error ? err.message : "Failed to create product."),
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

        <ProductForm
          key={isUpdate ? product.id : "create"}
          storeId={storeId}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isPending={isPending}
          serverError={serverError}
          submitLabel={isUpdate ? "Save changes" : "Add product"}
          showIsActive={isUpdate}
        />
      </div>
    </div>
  );
}
