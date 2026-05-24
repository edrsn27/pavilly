"use client";

import { useCallback, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnPinningState,
  type Column,
} from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { useGcashAccountsAll, type GcashAccountFull } from "@/shared/queries/gcash";
import { GcashAccountModal } from "@/features/gcash-accounts";
import styles from "./page.module.css";

const col = createColumnHelper<GcashAccountFull>();

const PINNED: ColumnPinningState = { left: ["name"], right: ["actions"] };

const pinStyle = (column: Column<GcashAccountFull>): React.CSSProperties => {
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

export default function GcashAccountsPage() {
  const { id: storeId } = useParams<{ id: string }>();
  const { data: accounts = [] } = useGcashAccountsAll(storeId);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<GcashAccountFull | null>(null);

  const openCreate = useCallback(() => {
    setEditing(null);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((account: GcashAccountFull) => {
    setEditing(account);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditing(null);
  }, []);

  const columns = useMemo(
    () => [
      col.accessor("name", {
        id: "name",
        header: "Label",
        size: 180,
        cell: (info) => <span className={styles.accountName}>{info.getValue()}</span>,
      }),
      col.accessor("number", {
        id: "number",
        header: "Number",
        size: 150,
        cell: (info) => <span className={styles.numeric}>{info.getValue()}</span>,
      }),
      col.accessor("balance", {
        id: "balance",
        header: "Balance",
        size: 130,
        cell: (info) => (
          <span className={`${styles.numeric} ${info.getValue() < 0 ? styles.negative : ""}`}>
            {formatPeso(info.getValue())}
          </span>
        ),
      }),
      col.accessor("is_active", {
        id: "status",
        header: "Status",
        size: 90,
        cell: (info) => (
          <span className={`${styles.badge} ${info.getValue() ? styles.badgeActive : styles.badgeInactive}`}>
            {info.getValue() ? "Active" : "Inactive"}
          </span>
        ),
      }),
      col.display({
        id: "actions",
        header: "",
        size: 56,
        cell: ({ row }) => (
          <button
            type="button"
            className={styles.editBtn}
            aria-label={`Edit ${row.original.name}`}
            onClick={() => openEdit(row.original)}
          >
            <Pencil size={14} aria-hidden="true" />
          </button>
        ),
      }),
    ],
    [openEdit]
  );

  const table = useReactTable({
    data: accounts,
    columns,
    state: { columnPinning: PINNED },
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>GCash Accounts</h1>
        <button type="button" className={styles.addBtn} onClick={openCreate}>
          + Add account
        </button>
      </div>

      <div className={styles.tableWrap}>
        {accounts.length === 0 ? (
          <div className={styles.empty}>No GCash accounts yet. Add one to start recording GCash services.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className={styles.th}
                      style={pinStyle(header.column)}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={`${styles.row}${!row.original.is_active ? ` ${styles.rowInactive}` : ""}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className={styles.td} style={pinStyle(cell.column)}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <GcashAccountModal
        storeId={storeId}
        open={modalOpen}
        editing={editing}
        onClose={closeModal}
      />
    </div>
  );
}
