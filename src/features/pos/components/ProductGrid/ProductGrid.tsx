"use client";

import { useState } from "react";
import { Search, ShoppingCart } from "lucide-react";
import { useProducts, type Product } from "@/shared/queries/products";
import { useCategories } from "@/shared/queries/categories";
import styles from "./ProductGrid.module.css";

interface ProductGridProps {
  storeId: string;
  onAddProduct: (product: Product) => void;
  itemCount: number;
  onViewCart: () => void;
}

const formatPeso = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);

export function ProductGrid({ storeId, onAddProduct, itemCount, onViewCart }: ProductGridProps) {
  const { data: products = [] } = useProducts(storeId);
  const { data: categories = [] } = useCategories(storeId);

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const activeProducts = products.filter((p) => p.is_active);

  const filteredProducts = activeProducts.filter((p) => {
    const matchesCategory =
      activeCategoryId === null || p.category_id === activeCategoryId;
    const matchesSearch =
      search.trim() === "" ||
      p.name.toLowerCase().includes(search.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedCategories = [...categories].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  return (
    <div className={styles.container}>
      <div className={styles.filters}>
        <div className={styles.topRow}>
          <div className={styles.categoryBar}>
          <button
            type="button"
            className={`${styles.categoryTab}${activeCategoryId === null ? ` ${styles.categoryTabActive}` : ""}`}
            onClick={() => setActiveCategoryId(null)}
          >
            All
          </button>
          {sortedCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`${styles.categoryTab}${activeCategoryId === cat.id ? ` ${styles.categoryTabActive}` : ""}`}
              onClick={() => setActiveCategoryId(cat.id)}
            >
              {cat.name}
            </button>
          ))}
          </div>

          <button
            type="button"
            className={styles.cartBtn}
            onClick={onViewCart}
            aria-label={`View cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
          >
            <ShoppingCart size={20} aria-hidden="true" />
            {itemCount > 0 && (
              <span className={styles.cartBadge}>{itemCount}</span>
            )}
          </button>
        </div>

        <div className={styles.searchWrapper}>
          <Search
            size={16}
            className={styles.searchIcon}
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search products…"
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search products"
          />
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className={styles.empty}>No products found.</div>
      ) : (
        <div className={styles.grid}>
          {filteredProducts.map((product) => {
            const isFixed = product.price_type === "fixed";
            const stock = product.inventory?.stock ?? 0;
            const threshold = product.inventory?.low_stock_threshold ?? 5;
            const isOutOfStock = isFixed && stock === 0;
            const isLowStock = isFixed && stock > 0 && stock <= threshold;

            return (
              <button
                key={product.id}
                type="button"
                className={`${styles.card}${isOutOfStock ? ` ${styles.cardDisabled}` : ""}`}
                onClick={() => !isOutOfStock && onAddProduct(product)}
                disabled={isOutOfStock}
                aria-label={`Add ${product.name} to cart${isOutOfStock ? " — out of stock" : ""}`}
              >
                <div className={styles.cardBody}>
                  <span className={styles.productName}>{product.name}</span>

                  <span className={styles.price}>
                    {isFixed && product.selling_price != null
                      ? formatPeso(product.selling_price)
                      : "Variable"}
                  </span>

                  {isFixed && (
                    <div className={styles.badgeRow}>
                      {isOutOfStock && (
                        <span className={`${styles.badge} ${styles.badgeRed}`}>
                          Out
                        </span>
                      )}
                      {isLowStock && (
                        <span
                          className={`${styles.badge} ${styles.badgeAmber}`}
                        >
                          Low
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
