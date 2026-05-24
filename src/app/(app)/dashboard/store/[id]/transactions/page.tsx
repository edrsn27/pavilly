"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type ColumnPinningState,
  type RowSelectionState,
  type Column,
} from "@tanstack/react-table";
import { ChevronUp, ChevronDown, ChevronsUpDown, Ban } from "lucide-react";
import {
  useTransactions,
  useVoidTransaction,
  useVoidTransactions,
  type Transaction,
} from "@/shared/queries/transactions";
import styles from "./transactions.module.css";

const col = createColumnHelper<Transaction>();

const PINNED: ColumnPinningState = { left: ["select", "created_at"], right: ["actions"] };
const NUMERIC_COLS = new Set(["total"]);

const pinStyle = (column: Column<Transaction>): React.CSSProperties => {
  const side = column.getIsPinned();
  if (!side) return { width: column.getSize() };
  return {
    position: "sticky",
    left: side === "left" ? column.getStart("left") : undefined,
    right: side === "right" ? column.getAfter("right") : undefined,
    zIndex: 1,
    width: column.getSize(),
  };
};

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

function Checkbox({
  indeterminate,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { indeterminate?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate ?? false;
  }, [indeterminate]);
  return <input ref={ref} type="checkbox" className={className} {...props} />;
}

type VoidTarget =
  | { kind: "single"; tx: Transaction }
  | { kind: "bulk"; ids: string[] };

export default function TransactionsPage() {
  const { id: storeId } = useParams<{ id: string }>();
  const { data: transactions = [] } = useTransactions(storeId);
  const { mutate: voidOne, isPending: voidingOne } = useVoidTransaction();
  const { mutate: voidMany, isPending: voidingMany } = useVoidTransactions();
  const voiding = voidingOne || voidingMany;

  const [sorting, setSorting] = useState<SortingState>([
    { id: "created_at", desc: true },
  ]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [voidTarget, setVoidTarget] = useState<VoidTarget | null>(null);
  const [voidReason, setVoidReason] = useState("");
  const [voidError, setVoidError] = useState<string | null>(null);

  const openVoidSingle = useCallback((tx: Transaction) => {
    setVoidTarget({ kind: "single", tx });
    setVoidReason("");
    setVoidError(null);
  }, []);

  const openVoidBulk = useCallback((ids: string[]) => {
    setVoidTarget({ kind: "bulk", ids });
    setVoidReason("");
    setVoidError(null);
  }, []);

  const closeVoid = useCallback(() => {
    setVoidTarget(null);
    setVoidReason("");
    setVoidError(null);
  }, []);

  const confirmVoid = () => {
    if (!voidTarget) return;
    if (!voidReason.trim()) {
      setVoidError("Void reason is required.");
      return;
    }
    if (voidTarget.kind === "single") {
      voidOne(
        { id: voidTarget.tx.id, storeId, voidReason: voidReason.trim() },
        {
          onSuccess: closeVoid,
          onError: (err) =>
            setVoidError(err instanceof Error ? err.message : "Failed to void transaction."),
        }
      );
    } else {
      voidMany(
        { ids: voidTarget.ids, storeId, voidReason: voidReason.trim() },
        {
          onSuccess: () => {
            closeVoid();
            setRowSelection({});
          },
          onError: (err) =>
            setVoidError(err instanceof Error ? err.message : "Failed to void transactions."),
        }
      );
    }
  };

  const columns = useMemo(
    () => [
      col.display({
        id: "select",
        size: 40,
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className={styles.checkbox}
            aria-label="Select all completed transactions"
          />
        ),
        cell: ({ row }) =>
          row.original.status === "completed" ? (
            <Checkbox
              checked={row.getIsSelected()}
              onChange={row.getToggleSelectedHandler()}
              className={styles.checkbox}
              aria-label="Select transaction"
            />
          ) : null,
      }),
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
          <span className={`${styles.statusBadge} ${STATUS_CLASS[info.getValue()] ?? ""}`}>
            {STATUS_LABEL[info.getValue()] ?? info.getValue()}
          </span>
        ),
      }),
      col.display({
        id: "actions",
        header: "",
        size: 56,
        cell: ({ row }) =>
          row.original.status === "completed" ? (
            <button
              type="button"
              className={styles.voidBtn}
              aria-label="Void transaction"
              onClick={() => openVoidSingle(row.original)}
            >
              <Ban size={14} aria-hidden="true" />
            </button>
          ) : null,
      }),
    ],
    [openVoidSingle]
  );

  const table = useReactTable({
    data: transactions,
    columns,
    state: { sorting, columnPinning: PINNED, rowSelection },
    getRowId: (row) => row.id,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: (row) => row.original.status === "completed",
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id]);

  const dialogTitle =
    voidTarget?.kind === "bulk"
      ? `Void ${voidTarget.ids.length} transaction${voidTarget.ids.length === 1 ? "" : "s"}`
      : "Void transaction";

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Transactions</h1>
        {selectedIds.length > 0 && (
          <button
            type="button"
            className={styles.bulkVoidBtn}
            onClick={() => openVoidBulk(selectedIds)}
          >
            Void ({selectedIds.length})
          </button>
        )}
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
                        style={pinStyle(header.column)}
                        onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      >
                        <span className={styles.thInner}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort && (
                            <span className={sorted ? styles.sortIcon : styles.sortIconIdle}>
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
                <tr
                  key={row.id}
                  className={`${styles.row}${row.original.status !== "completed" ? ` ${styles.rowMuted}` : ""}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`${styles.td}${NUMERIC_COLS.has(cell.column.id) ? ` ${styles.colNumeric}` : ""}`}
                      style={pinStyle(cell.column)}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Void dialog ──────────────────────────────────────────── */}
      {voidTarget && (
        <div className={styles.backdrop} onClick={closeVoid}>
          <div
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="void-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="void-dialog-title" className={styles.dialogTitle}>
              {dialogTitle}
            </h2>
            {voidTarget.kind === "single" && (
              <p className={styles.dialogMeta}>
                {formatDate(voidTarget.tx.created_at)} · {formatPeso(voidTarget.tx.total)}
              </p>
            )}

            <div className={styles.dialogField}>
              <label htmlFor="void-reason" className={styles.dialogLabel}>
                Reason{" "}
                <span className={styles.dialogRequired} aria-hidden="true">
                  *
                </span>
              </label>
              <textarea
                id="void-reason"
                rows={3}
                autoFocus
                placeholder="e.g. Wrong item scanned"
                className={`${styles.dialogTextarea}${voidError ? ` ${styles.dialogTextareaError}` : ""}`}
                value={voidReason}
                onChange={(e) => {
                  setVoidReason(e.target.value);
                  setVoidError(null);
                }}
              />
              {voidError && (
                <span className={styles.dialogError} role="alert">
                  {voidError}
                </span>
              )}
            </div>

            <div className={styles.dialogFooter}>
              <button type="button" className={styles.dialogCancelBtn} onClick={closeVoid}>
                Cancel
              </button>
              <button
                type="button"
                className={styles.dialogVoidBtn}
                onClick={confirmVoid}
                disabled={voiding}
              >
                {voiding ? "Voiding…" : dialogTitle}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
