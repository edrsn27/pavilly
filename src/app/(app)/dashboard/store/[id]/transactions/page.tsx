"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { useTransactions, type Transaction } from "@/shared/queries/transactions";
import styles from "./transactions.module.css";

const formatPeso = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));

const TYPE_LABEL: Record<string, string> = {
  sale: "Sale",
  gcash_in: "GCash In",
  gcash_out: "GCash Out",
};

const PAYMENT_LABEL: Record<string, string> = {
  cash: "Cash",
  gcash: "GCash",
  maya: "Maya",
  card: "Card",
};

const STATUS_LABEL: Record<string, string> = {
  completed: "Completed",
  voided: "Voided",
  refunded: "Refunded",
};

const STATUS_CLASS: Record<string, string> = {
  completed: styles.statusCompleted,
  voided: styles.statusVoided,
  refunded: styles.statusRefunded,
};

const col = createColumnHelper<Transaction>();

const COLUMNS = [
  col.accessor("created_at", {
    id: "created_at",
    header: "Date",
    size: 160,
    cell: (info) => formatDate(info.getValue()),
  }),
  col.accessor("transaction_type", {
    id: "type",
    header: "Type",
    size: 100,
    cell: (info) => TYPE_LABEL[info.getValue()] ?? info.getValue(),
  }),
  col.accessor("total", {
    id: "total",
    header: "Total",
    size: 130,
    cell: (info) => formatPeso(info.getValue()),
  }),
  col.accessor("payment_method", {
    id: "payment",
    header: "Payment",
    size: 110,
    cell: (info) => PAYMENT_LABEL[info.getValue()] ?? info.getValue(),
  }),
  col.accessor("status", {
    id: "status",
    header: "Status",
    size: 110,
    cell: (info) => (
      <span
        className={`${styles.statusBadge} ${STATUS_CLASS[info.getValue()] ?? ""}`}
      >
        {STATUS_LABEL[info.getValue()] ?? info.getValue()}
      </span>
    ),
  }),
];

const NUMERIC_COLS = new Set(["total"]);

export default function TransactionsPage() {
  const { id: storeId } = useParams<{ id: string }>();
  const { data: transactions = [] } = useTransactions(storeId);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "created_at", desc: true },
  ]);

  const table = useReactTable({
    data: transactions,
    columns: COLUMNS,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Transactions</h1>
      </div>

      <div className={styles.tableWrap}>
        {transactions.length === 0 ? (
          <div className={styles.empty}>No transactions yet.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const sorted = header.column.getIsSorted();
                    return (
                      <th
                        key={header.id}
                        className={`${styles.th}${canSort ? ` ${styles.thSortable}` : ""}`}
                        style={{ width: header.column.getSize() }}
                        onClick={
                          canSort
                            ? header.column.getToggleSortingHandler()
                            : undefined
                        }
                      >
                        <span className={styles.thInner}>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {canSort && (
                            <span
                              className={
                                sorted ? styles.sortIcon : styles.sortIconIdle
                              }
                            >
                              {sorted === "asc" ? (
                                <ChevronUp size={12} />
                              ) : sorted === "desc" ? (
                                <ChevronDown size={12} />
                              ) : (
                                <ChevronsUpDown size={12} />
                              )}
                            </span>
                          )}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className={styles.row}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`${styles.td}${NUMERIC_COLS.has(cell.column.id) ? ` ${styles.colNumeric}` : ""}`}
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
