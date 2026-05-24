"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ChevronLeft, X, ShoppingBag } from "lucide-react";
import { useProducts, type Product } from "@/shared/queries/products";
import type { CartItem } from "../../PosTerminal.types";
import { BarcodeProductModal } from "./BarcodeProductModal";
import styles from "./ScannerView.module.css";

const Scanner = dynamic(
  () => import("@yudiel/react-qr-scanner").then((m) => m.Scanner),
  { ssr: false }
);

const formatPeso = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);

interface ScannerViewProps {
  storeId: string;
  items: CartItem[];
  total: number;
  onBack: () => void;
  onAddToCart: (product: Product) => void;
  onUpdateQty: (
    productId: string,
    priceType: "fixed" | "variable",
    unitPrice: number,
    delta: number
  ) => void;
  onRemove: (
    productId: string,
    priceType: "fixed" | "variable",
    unitPrice: number
  ) => void;
  onClear: () => void;
  onCheckout: () => void;
}

export function ScannerView({
  storeId,
  items,
  total,
  onBack,
  onAddToCart,
  onUpdateQty,
  onRemove,
  onClear,
  onCheckout,
}: ScannerViewProps) {
  const { data: products = [] } = useProducts(storeId);
  const [newBarcode, setNewBarcode] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);

  const handleScan = (rawValue: string) => {
    const match = products.find((p) => p.barcode === rawValue);
    if (match) {
      onAddToCart(match);
    } else {
      setPaused(true);
      setNewBarcode(rawValue);
    }
  };

  return (
    <div className={styles.view}>
      {/* Camera */}
      <div className={styles.camera}>
        <button
          type="button"
          className={styles.back}
          onClick={onBack}
          aria-label="Back to products"
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
        <Scanner
          paused={paused}
          onScan={(codes) => {
            if (codes.length > 0) handleScan(codes[0].rawValue);
          }}
          onError={onBack}
          constraints={{ facingMode: "environment" }}
          formats={["qr_code", "ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39"]}
          components={{ finder: true }}
          styles={{ container: { width: "100%", height: "100%" } }}
        />
      </div>

      {/* Order overview */}
      <div className={styles.order}>
        <div className={styles.orderHeader}>
          <span className={styles.orderTitle}>Order</span>
          {items.length > 0 && (
            <button type="button" className={styles.clearBtn} onClick={onClear}>
              Clear
            </button>
          )}
        </div>

        <div className={styles.itemList}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              <ShoppingBag size={32} aria-hidden="true" className={styles.emptyIcon} />
              <p className={styles.emptyText}>Cart is empty</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={`${item.productId}-${item.priceType}-${item.unitPrice}`}
                className={styles.item}
              >
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.productName}</span>
                  <span className={styles.itemUnit}>{formatPeso(item.unitPrice)}</span>
                </div>
                <div className={styles.itemControls}>
                  <button
                    type="button"
                    className={styles.qtyBtn}
                    onClick={() => onUpdateQty(item.productId, item.priceType, item.unitPrice, -1)}
                    aria-label={`Decrease ${item.productName}`}
                  >
                    −
                  </button>
                  <span className={styles.qty}>{item.quantity}</span>
                  <button
                    type="button"
                    className={styles.qtyBtn}
                    onClick={() => onUpdateQty(item.productId, item.priceType, item.unitPrice, 1)}
                    aria-label={`Increase ${item.productName}`}
                  >
                    +
                  </button>
                  <span className={styles.lineTotal}>
                    {formatPeso(item.unitPrice * item.quantity)}
                  </span>
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => onRemove(item.productId, item.priceType, item.unitPrice)}
                    aria-label={`Remove ${item.productName}`}
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Total</span>
            <span className={styles.totalAmount}>{formatPeso(total)}</span>
          </div>
          <button
            type="button"
            className={styles.checkoutBtn}
            disabled={items.length === 0}
            onClick={onCheckout}
          >
            Checkout →
          </button>
        </div>
      </div>

      {newBarcode && (
        <BarcodeProductModal
          key={newBarcode}
          barcode={newBarcode}
          storeId={storeId}
          onSuccess={() => {
            setNewBarcode(null);
            setPaused(false);
          }}
          onClose={() => {
            setNewBarcode(null);
            setPaused(false);
          }}
        />
      )}
    </div>
  );
}
