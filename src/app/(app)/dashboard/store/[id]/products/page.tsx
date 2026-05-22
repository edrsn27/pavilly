"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { Plus, Search, Package } from "lucide-react";
import { useProducts } from "@/shared/queries/products";
import { ProductModal } from "@/features/products";
import type { Product } from "@/shared/queries/products";
import styles from "./products.module.css";

function formatPeso(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);
}

function StockBadge({ product }: { product: Product }) {
  const inv = product.inventory;
  if (product.price_type === "variable") {
    return <span className={styles.stockNA}>—</span>;
  }
  if (!inv) return <span className={styles.stockNA}>—</span>;
  const isLow = inv.stock <= inv.low_stock_threshold;
  return (
    <span className={`${styles.stock}${isLow ? ` ${styles.stockLow}` : ""}`}>
      {inv.stock}
    </span>
  );
}

export default function ProductsPage() {
  const { id: storeId } = useParams<{ id: string }>();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();

  const { data: products, isLoading } = useProducts(storeId);

  const filtered = useMemo(() => {
    if (!products) return [];
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, search]);

  function openCreate() {
    setEditingProduct(undefined);
    setModalOpen(true);
  }

  function openEdit(product: Product) {
    setEditingProduct(product);
    setModalOpen(true);
  }

  function handleClose() {
    setModalOpen(false);
    setEditingProduct(undefined);
  }

  return (
    <div className={styles.page}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Products</h1>
        <button type="button" className={styles.addBtn} onClick={openCreate}>
          <Plus size={16} strokeWidth={2.5} aria-hidden="true" />
          Add product
        </button>
      </div>

      {/* ── Search ──────────────────────────────────────────────── */}
      <div className={styles.searchWrapper}>
        <Search size={16} className={styles.searchIcon} aria-hidden="true" />
        <input
          type="search"
          placeholder="Search products…"
          className={styles.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search products"
        />
      </div>

      {/* ── Product modal ────────────────────────────────────────── */}
      <ProductModal
        open={modalOpen}
        onClose={handleClose}
        storeId={storeId}
        product={editingProduct}
      />

      {/* ── Content ─────────────────────────────────────────────── */}
      {isLoading ? (
        <div className={styles.emptyState}>Loading…</div>
      ) : !filtered.length ? (
        <div className={styles.emptyState}>
          {search ? (
            <>No products match &ldquo;{search}&rdquo;.</>
          ) : (
            <div className={styles.emptyContent}>
              <Package size={32} strokeWidth={1.5} aria-hidden="true" />
              <p>No products yet. Add your first product to get started.</p>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Type</th>
                <th className={styles.colRight}>Cost</th>
                <th className={styles.colRight}>Price</th>
                <th className={styles.colRight}>Stock</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className={styles.productName}>{product.name}</div>
                    {product.description && (
                      <div className={styles.productDesc}>{product.description}</div>
                    )}
                  </td>
                  <td>
                    <span className={`${styles.typeBadge} ${styles[`type_${product.price_type}`]}`}>
                      {product.price_type === "fixed" ? "Fixed" : "Variable"}
                    </span>
                  </td>
                  <td className={`${styles.colRight} ${styles.colNumeric}`}>
                    {product.cost_price != null ? formatPeso(product.cost_price) : "—"}
                  </td>
                  <td className={`${styles.colRight} ${styles.colNumeric}`}>
                    {product.price_type === "variable"
                      ? <span className={styles.colMuted}>At POS</span>
                      : product.selling_price != null
                        ? formatPeso(product.selling_price)
                        : "—"}
                  </td>
                  <td className={styles.colRight}>
                    <StockBadge product={product} />
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${product.is_active ? styles.statusActive : styles.statusInactive}`}>
                      {product.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className={styles.colActions}>
                    <button
                      type="button"
                      className={styles.editBtn}
                      onClick={() => openEdit(product)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
