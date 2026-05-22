"use client";

import { ShoppingBag, X, ChevronLeft } from "lucide-react";
import type { CartItem } from "../../PosTerminal.types";
import styles from "./Cart.module.css";

interface CartProps {
  items: CartItem[];
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
  onClose?: () => void;
}

const formatPeso = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);

export function Cart({
  items,
  onUpdateQty,
  onRemove,
  onClear,
  onCheckout,
  onClose,
}: CartProps) {
  const total = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const isEmpty = items.length === 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {onClose && (
          <button
            type="button"
            className={styles.backBtn}
            onClick={onClose}
            aria-label="Back to products"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
        )}
        <h2 className={styles.title}>Order</h2>
        {!isEmpty && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={onClear}
            aria-label="Clear cart"
          >
            Clear
          </button>
        )}
      </div>

      <div className={styles.itemList}>
        {isEmpty ? (
          <div className={styles.empty}>
            <ShoppingBag
              size={40}
              className={styles.emptyIcon}
              aria-hidden="true"
            />
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
                <span className={styles.itemUnitPrice}>
                  {formatPeso(item.unitPrice)}
                </span>
              </div>

              <div className={styles.itemControls}>
                <button
                  type="button"
                  className={styles.qtyBtn}
                  onClick={() =>
                    onUpdateQty(
                      item.productId,
                      item.priceType,
                      item.unitPrice,
                      -1
                    )
                  }
                  aria-label={`Decrease quantity of ${item.productName}`}
                >
                  −
                </button>
                <span className={styles.qty}>{item.quantity}</span>
                <button
                  type="button"
                  className={styles.qtyBtn}
                  onClick={() =>
                    onUpdateQty(
                      item.productId,
                      item.priceType,
                      item.unitPrice,
                      1
                    )
                  }
                  aria-label={`Increase quantity of ${item.productName}`}
                >
                  +
                </button>

                <span className={styles.lineTotal}>
                  {formatPeso(item.unitPrice * item.quantity)}
                </span>

                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() =>
                    onRemove(item.productId, item.priceType, item.unitPrice)
                  }
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
          disabled={isEmpty}
          onClick={onCheckout}
        >
          Checkout →
        </button>
      </div>
    </div>
  );
}
