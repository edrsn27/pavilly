"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useCreateProduct } from "@/shared/queries/products";
import { ProductForm } from "@/shared/components/ProductForm";
import type { ProductFormValues } from "@/shared/components/ProductForm";
import styles from "./BarcodeProductModal.module.css";

interface BarcodeProductModalProps {
  barcode: string;
  storeId: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function BarcodeProductModal({ barcode, storeId, onSuccess, onClose }: BarcodeProductModalProps) {
  const { mutate: createProduct, isPending } = useCreateProduct();
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = (data: ProductFormValues) => {
    setServerError(null);

    const initialStock =
      data.price_type === "fixed"
        ? Math.max(0, parseInt(data.stock, 10) || 0)
        : undefined;

    createProduct(
      {
        store_id: storeId,
        name: data.name.trim(),
        barcode: barcode || undefined,
        price_type: data.price_type,
        cost_price: data.cost_price ? parseFloat(data.cost_price) : undefined,
        selling_price:
          data.price_type === "fixed" && data.selling_price
            ? parseFloat(data.selling_price)
            : undefined,
        is_active: true,
        initialStock,
      },
      {
        onSuccess,
        onError: (err) =>
          setServerError(err instanceof Error ? err.message : "Failed to add product."),
      }
    );
  };

  return createPortal(
    <div className={styles.backdrop}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="barcode-modal-title"
      >
        <div className={styles.header}>
          <h2 id="barcode-modal-title" className={styles.title}>New barcode</h2>
          <p className={styles.description}>
            No product matched this barcode. Fill in the details to add it.
          </p>
          <div className={styles.barcodeChip}>{barcode}</div>
        </div>

        <ProductForm
          storeId={storeId}
          defaultValues={{ barcode, price_type: "fixed", stock: "1" }}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isPending={isPending}
          serverError={serverError}
          submitLabel="Add product"
          showDescription={false}
          showBarcode={false}
          showCategory={false}
          showIsActive={false}
        />
      </div>
    </div>,
    document.body
  );
}
