"use client";

import { useState } from "react";
import { ShoppingCart, Camera } from "lucide-react";
import type { Product } from "@/shared/queries/products";
import type { CartItem } from "./PosTerminal.types";
import { ProductGrid } from "./components/ProductGrid/ProductGrid";
import { Cart } from "./components/Cart/Cart";
import { CheckoutPanel } from "./components/CheckoutPanel/CheckoutPanel";
import { VariablePriceDialog } from "./components/VariablePriceDialog/VariablePriceDialog";
import { ScannerView } from "./components/ScannerView";
import { OutOfStockModal } from "./components/OutOfStockModal";
import styles from "./PosTerminal.module.css";

interface PosTerminalProps {
  storeId: string;
}

export function PosTerminal({ storeId }: PosTerminalProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [view, setView] = useState<"products" | "cart" | "checkout" | "scanner">("products");
  const [pendingVariable, setPendingVariable] = useState<Product | null>(null);
  const [outOfStock, setOutOfStock] = useState<Product | null>(null);
  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const addProduct = (product: Product) => {
    if (product.price_type === "variable") {
      setPendingVariable(product);
      return;
    }

    const stock = product.inventory?.stock ?? 0;
    if (stock === 0) {
      setOutOfStock(product);
      return;
    }

    const unitPrice = product.selling_price ?? 0;
    setItems((prev) => {
      const existing = prev.find(
        (item) =>
          item.productId === product.id &&
          item.priceType === "fixed" &&
          item.unitPrice === unitPrice
      );
      if (existing) {
        return prev.map((item) =>
          item === existing
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          priceType: "fixed",
          unitPrice,
          costPrice: product.cost_price,
          quantity: 1,
        },
      ];
    });
  };

  const handleVariableConfirm = (price: number) => {
    if (!pendingVariable) return;
    setItems((prev) => [
      ...prev,
      {
        productId: pendingVariable.id,
        productName: pendingVariable.name,
        priceType: "variable",
        unitPrice: price,
        costPrice: pendingVariable.cost_price,
        quantity: 1,
      },
    ]);
    setPendingVariable(null);
  };

  const updateQty = (
    productId: string,
    priceType: "fixed" | "variable",
    unitPrice: number,
    delta: number
  ) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (
            item.productId === productId &&
            item.priceType === priceType &&
            item.unitPrice === unitPrice
          ) {
            return { ...item, quantity: item.quantity + delta };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (
    productId: string,
    priceType: "fixed" | "variable",
    unitPrice: number
  ) => {
    setItems((prev) =>
      prev.filter(
        (item) =>
          !(
            item.productId === productId &&
            item.priceType === priceType &&
            item.unitPrice === unitPrice
          )
      )
    );
  };

  const pushItem = (product: Product) => {
    const unitPrice = product.selling_price ?? 0;
    setItems((prev) => {
      const existing = prev.find(
        (item) =>
          item.productId === product.id &&
          item.priceType === "fixed" &&
          item.unitPrice === unitPrice
      );
      if (existing) {
        return prev.map((item) =>
          item === existing ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          priceType: "fixed",
          unitPrice,
          costPrice: product.cost_price,
          quantity: 1,
        },
      ];
    });
  };

  const clearCart = () => {
    setItems([]);
    setView("products");
  };

  const handleSuccess = () => {
    setItems([]);
    setView("products");
  };

  const sidebarContent =
    view === "checkout" ? (
      <CheckoutPanel
        storeId={storeId}
        items={items}
        total={total}
        onBack={() => setView("cart")}
        onSuccess={handleSuccess}
      />
    ) : view === "scanner" ? (
      <ScannerView
        storeId={storeId}
        items={items}
        total={total}
        onBack={() => setView("products")}
        onAddToCart={addProduct}
        onUpdateQty={updateQty}
        onRemove={removeItem}
        onClear={clearCart}
        onCheckout={() => setView("checkout")}
      />
    ) : (
      <Cart
        items={items}
        onUpdateQty={updateQty}
        onRemove={removeItem}
        onClear={clearCart}
        onClose={view === "cart" ? () => setView("products") : undefined}
        onCheckout={() => setView("checkout")}
      />
    );

  return (
    <div className={styles.terminal}>
      <div className={styles.productPane}>
        <ProductGrid
          storeId={storeId}
          onAddProduct={addProduct}
        />
      </div>

      <div className={`${styles.sidebar}${view === "cart" || view === "checkout" || view === "scanner" ? ` ${styles.sidebarOpen}` : ""}`}>
        {sidebarContent}
      </div>

      {/* Cart FAB — mobile only, shown on product view */}
      {view === "products" && (
        <button
          className={styles.cartFab}
          onClick={() => setView("cart")}
          aria-label={`View cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
        >
          <ShoppingCart size={22} aria-hidden="true" />
          {itemCount > 0 && (
            <span className={styles.cartFabBadge} aria-hidden="true">
              {itemCount > 99 ? "99+" : itemCount}
            </span>
          )}
        </button>
      )}

      {/* Camera FAB — mobile only, shown on product view */}
      {view === "products" && (
        <button
          className={styles.cameraFab}
          onClick={() => setView("scanner")}
          aria-label="Scan barcode"
        >
          <Camera size={22} aria-hidden="true" />
        </button>
      )}

      <VariablePriceDialog
        productName={pendingVariable?.name ?? ""}
        open={pendingVariable !== null}
        onConfirm={handleVariableConfirm}
        onClose={() => setPendingVariable(null)}
      />

      {outOfStock && (
        <OutOfStockModal
          key={outOfStock.id}
          product={outOfStock}
          storeId={storeId}
          onSuccess={() => {
            const product = outOfStock;
            setOutOfStock(null);
            pushItem(product);
          }}
          onClose={() => setOutOfStock(null)}
        />
      )}

    </div>
  );
}
