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
  Search,
  Boxes,
  TrendingDown,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import { useInventory } from "@/shared/queries/inventory";
import { AdjustStockModal } from "@/features/inventory";
import { TextTruncate } from "@/shared/components";
import type { InventoryItem } from "@/shared/queries/inventory";
import styles from "./inventory.module.css";

type FilterTab = "all" | "low" | "out";

function StockCell({ item }: { item: InventoryItem }) {
  if (item.priceType === "variable") return <span className={styles.stockNA}>N/A</span>;
  if (item.stock === 0) return <span className={`${styles.stockNum} ${styles.stockOut}`}>0</span>;
  if (item.stock <= item.lowStockThreshold) return <span className={`${styles.stockNum} ${styles.stockLow}`}>{item.stock}</span>;
  return <span className={styles.stockNum}>{item.stock}</span>;
}

function StatusBadge({ item }: { item: InventoryItem }) {
  if (item.priceType === "variable") return <span className={`${styles.badge} ${styles.badgeVariable}`}>Variable</span>;
  if (item.stock === 0) return <span className={`${styles.badge} ${styles.badgeOut}`}>Out of stock</span>;
  if (item.stock <= item.lowStockThreshold) return <span className={`${styles.badge} ${styles.badgeLow}`}>Low stock</span>;
  return <span className={`${styles.badge} ${styles.badgeOk}`}>In stock</span>;
}

function SortIcon({ column }: { column: Column<InventoryItem> }) {
  if (!column.getCanSort()) return null;
  const sorted = column.getIsSorted();
  if (sorted === "asc") return <ChevronUp size={13} className={styles.sortIcon} aria-hidden="true" />;
  if (sorted === "desc") return <ChevronDown size={13} className={styles.sortIcon} aria-hidden="true" />;
  return <ChevronsUpDown size={13} className={`${styles.sortIcon} ${styles.sortIconIdle}`} aria-hidden="true" />;
}

function pinStyle(column: Column<InventoryItem>): React.CSSProperties {
  const pinned = column.getIsPinned();
  if (!pinned) return {};
  return {
    position: "sticky",
    left: pinned === "left" ? column.getStart("left") : undefined,
    right: pinned === "right" ? column.getAfter("right") : undefined,
    zIndex: 2,
  };
}

const columnHelper = createColumnHelper<InventoryItem>();
const RIGHT_COLS = new Set(["stock", "threshold", "updatedAt"]);

const COLUMN_PINNING: ColumnPinningState = {
  left: ["product"],
};

export default function InventoryPage() {
  const { id: storeId } = useParams<{ id: string }>();
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [sorting, setSorting] = useState<SortingState>([{ id: "product", desc: false }]);
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);

  const { data: items = [], isLoading } = useInventory(storeId);

  const data = useMemo(() => {
    let list = items;
    if (filterTab === "low") list = list.filter(i => i.priceType === "fixed" && i.stock > 0 && i.stock <= i.lowStockThreshold);
    else if (filterTab === "out") list = list.filter(i => i.priceType === "fixed" && i.stock === 0);
    const q = search.trim().toLowerCase();
    if (q) list = list.filter(i => i.productName.toLowerCase().includes(q));
    return list;
  }, [items, filterTab, search]);

  const counts = useMemo(() => {
    const fixed = items.filter(i => i.priceType === "fixed");
    return {
      all: items.length,
      low: fixed.filter(i => i.stock > 0 && i.stock <= i.lowStockThreshold).length,
      out: fixed.filter(i => i.stock === 0).length,
    };
  }, [items]);

  const columns = useMemo(() => [
    columnHelper.accessor("productName", {
      id: "product",
      header: "Product",
      size: 200,
      cell: ({ getValue, row }) => (
        <div>
          <TextTruncate text={getValue()} className={styles.productName} />
          {!row.original.isActive && <span className={styles.inactiveTag}>Inactive</span>}
        </div>
      ),
    }),
    columnHelper.display({
      id: "status",
      header: "Status",
      size: 130,
      enableSorting: false,
      cell: ({ row }) => <StatusBadge item={row.original} />,
    }),
    columnHelper.accessor("stock", {
      id: "stock",
      header: "Stock",
      size: 90,
      cell: ({ row }) => <StockCell item={row.original} />,
    }),
    columnHelper.accessor("lowStockThreshold", {
      id: "threshold",
      header: "Low at",
      size: 90,
      cell: ({ getValue, row }) => row.original.priceType === "variable" ? "—" : getValue(),
    }),
    columnHelper.accessor("updatedAt", {
      id: "updatedAt",
      header: "Last updated",
      size: 120,
      cell: ({ getValue }) =>
        new Date(getValue()).toLocaleDateString("en-PH", { month: "short", day: "numeric" }),
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      size: 80,
      enableSorting: false,
      cell: ({ row }) =>
        row.original.priceType === "fixed" ? (
          <button
            type="button"
            className={styles.adjustBtn}
            onClick={() => setAdjustingItem(row.original)}
          >
            Adjust
          </button>
        ) : null,
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

  return (
    <div className={styles.page}>

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Inventory</h1>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.filterGroup} role="group" aria-label="Filter inventory">
          <button
            type="button"
            className={`${styles.filterBtn}${filterTab === "all" ? ` ${styles.filterBtnActive}` : ""}`}
            onClick={() => setFilterTab("all")}
          >
            All
            <span className={styles.filterCount}>{counts.all}</span>
          </button>
          <button
            type="button"
            className={`${styles.filterBtn}${filterTab === "low" ? ` ${styles.filterBtnActive}` : ""}${counts.low > 0 ? ` ${styles.filterBtnWarning}` : ""}`}
            onClick={() => setFilterTab("low")}
          >
            <TrendingDown size={13} aria-hidden="true" />
            Low stock
            {counts.low > 0 && (
              <span className={`${styles.filterCount} ${styles.filterCountWarning}`}>{counts.low}</span>
            )}
          </button>
          <button
            type="button"
            className={`${styles.filterBtn}${filterTab === "out" ? ` ${styles.filterBtnActive}` : ""}${counts.out > 0 ? ` ${styles.filterBtnDanger}` : ""}`}
            onClick={() => setFilterTab("out")}
          >
            <AlertTriangle size={13} aria-hidden="true" />
            Out of stock
            {counts.out > 0 && (
              <span className={`${styles.filterCount} ${styles.filterCountDanger}`}>{counts.out}</span>
            )}
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
            aria-label="Search inventory"
          />
        </div>
      </div>

      {adjustingItem && (
        <AdjustStockModal
          open
          onClose={() => setAdjustingItem(null)}
          storeId={storeId}
          item={adjustingItem}
        />
      )}

      {isLoading ? (
        <div className={styles.emptyState}>Loading…</div>
      ) : !table.getRowModel().rows.length ? (
        <div className={styles.emptyState}>
          {search || filterTab !== "all" ? (
            <p>No products match the current filter.</p>
          ) : (
            <div className={styles.emptyContent}>
              <Boxes size={32} strokeWidth={1.5} aria-hidden="true" />
              <p>No inventory yet. Add products to start tracking stock.</p>
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
                        RIGHT_COLS.has(cell.column.id) ? styles.colRight : "",
                        cell.column.id === "threshold" || cell.column.id === "updatedAt" ? styles.colMuted : "",
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
