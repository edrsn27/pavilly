"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type ColumnPinningState,
  type Column,
} from "@tanstack/react-table";
import {
  Plus,
  Search,
  Package,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import { useProducts } from "@/shared/queries/products";
import { ProductModal } from "@/features/products";
import { TextTruncate } from "@/shared/components";
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
  if (product.price_type === "variable") return <span className={styles.stockNA}>—</span>;
  if (!inv) return <span className={styles.stockNA}>—</span>;
  const isLow = inv.stock <= inv.low_stock_threshold;
  return <span className={`${styles.stock}${isLow ? ` ${styles.stockLow}` : ""}`}>{inv.stock}</span>;
}

function SortIcon({ column }: { column: Column<Product> }) {
  if (!column.getCanSort()) return null;
  const sorted = column.getIsSorted();
  if (sorted === "asc") return <ChevronUp size={13} className={styles.sortIcon} aria-hidden="true" />;
  if (sorted === "desc") return <ChevronDown size={13} className={styles.sortIcon} aria-hidden="true" />;
  return <ChevronsUpDown size={13} className={`${styles.sortIcon} ${styles.sortIconIdle}`} aria-hidden="true" />;
}

function pinStyle(column: Column<Product>): React.CSSProperties {
  const pinned = column.getIsPinned();
  if (!pinned) return {};
  return {
    position: "sticky",
    left: pinned === "left" ? column.getStart("left") : undefined,
    right: pinned === "right" ? column.getAfter("right") : undefined,
    zIndex: 2,
  };
}

const columnHelper = createColumnHelper<Product>();
const RIGHT_COLS = new Set(["cost", "price", "stock"]);

const COLUMN_PINNING: ColumnPinningState = {
  left: ["product"],
};

export default function ProductsPage() {
  const { id: storeId } = useParams<{ id: string }>();
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([{ id: "product", desc: false }]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();

  const { data: products = [], isLoading } = useProducts(storeId);

  const data = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, search]);

  const columns = useMemo(() => [
    columnHelper.accessor("name", {
      id: "product",
      header: "Product",
      size: 200,
      cell: ({ getValue, row }) => (
        <div>
          <TextTruncate text={getValue()} className={styles.productName} />
          {row.original.description && (
            <TextTruncate text={row.original.description} className={styles.productDesc} />
          )}
        </div>
      ),
    }),
    columnHelper.accessor("price_type", {
      id: "type",
      header: "Type",
      size: 100,
      enableSorting: false,
      cell: ({ getValue }) => (
        <span className={`${styles.typeBadge} ${styles[`type_${getValue()}`]}`}>
          {getValue() === "fixed" ? "Fixed" : "Variable"}
        </span>
      ),
    }),
    columnHelper.accessor("cost_price", {
      id: "cost",
      header: "Cost",
      size: 110,
      cell: ({ getValue }) => getValue() != null ? formatPeso(getValue()!) : "—",
    }),
    columnHelper.accessor("selling_price", {
      id: "price",
      header: "Price",
      size: 110,
      cell: ({ getValue, row }) =>
        row.original.price_type === "variable" ? (
          <span className={styles.colMuted}>At POS</span>
        ) : getValue() != null ? (
          formatPeso(getValue()!)
        ) : "—",
    }),
    columnHelper.display({
      id: "stock",
      header: "Stock",
      size: 80,
      enableSorting: false,
      cell: ({ row }) => <StockBadge product={row.original} />,
    }),
    columnHelper.accessor("is_active", {
      id: "status",
      header: "Status",
      size: 90,
      enableSorting: false,
      cell: ({ getValue }) => (
        <span className={`${styles.statusBadge} ${getValue() ? styles.statusActive : styles.statusInactive}`}>
          {getValue() ? "Active" : "Inactive"}
        </span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      size: 70,
      enableSorting: false,
      cell: ({ row }) => (
        <button
          type="button"
          className={styles.editBtn}
          onClick={() => {
            setEditingProduct(row.original);
            setModalOpen(true);
          }}
        >
          Edit
        </button>
      ),
    }),
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnPinning: COLUMN_PINNING },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  function openCreate() {
    setEditingProduct(undefined);
    setModalOpen(true);
  }

  function handleClose() {
    setModalOpen(false);
    setEditingProduct(undefined);
  }

  return (
    <div className={styles.page}>

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Products</h1>
        <button type="button" className={styles.addBtn} onClick={openCreate}>
          <Plus size={16} strokeWidth={2.5} aria-hidden="true" />
          Add product
        </button>
      </div>

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

      <ProductModal
        open={modalOpen}
        onClose={handleClose}
        storeId={storeId}
        product={editingProduct}
      />

      {isLoading ? (
        <div className={styles.emptyState}>Loading…</div>
      ) : !table.getRowModel().rows.length ? (
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
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    return (
                      <th
                        key={header.id}
                        className={[
                          RIGHT_COLS.has(header.id) ? styles.colRight : "",
                          canSort ? styles.thSortable : "",
                          header.column.getIsPinned() ? styles.pinned : "",
                        ].filter(Boolean).join(" ")}
                        style={{ width: header.column.getSize(), ...pinStyle(header.column) }}
                        onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                        aria-sort={
                          header.column.getIsSorted() === "asc" ? "ascending"
                          : header.column.getIsSorted() === "desc" ? "descending"
                          : undefined
                        }
                      >
                        <span className={styles.thInner}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <SortIcon column={header.column} />
                        </span>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={[
                        RIGHT_COLS.has(cell.column.id) ? styles.colNumeric : "",
                        cell.column.id === "actions" ? styles.colActions : "",
                        cell.column.getIsPinned() ? styles.pinned : "",
                      ].filter(Boolean).join(" ")}
                      style={{ width: cell.column.getSize(), ...pinStyle(cell.column) }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
