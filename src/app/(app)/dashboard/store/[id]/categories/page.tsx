"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
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
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  type Category,
} from "@/shared/queries/categories";
import { CategoryModal } from "./CategoryModal";
import styles from "./categories.module.css";

const col = createColumnHelper<Category>();

const PINNED: ColumnPinningState = { left: ["name"], right: ["actions"] };

const pinStyle = (column: Column<Category>): React.CSSProperties => {
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

export default function CategoriesPage() {
  const { id: storeId } = useParams<{ id: string }>();
  const { data: categories = [] } = useCategories(storeId);

  const [sorting, setSorting] = useState<SortingState>([
    { id: "sort_order", desc: false },
  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory();
  const { mutate: deleteCategory } = useDeleteCategory();

  const nextSortOrder = useMemo(
    () =>
      categories.length > 0
        ? Math.max(...categories.map((c) => c.sort_order)) + 1
        : 0,
    [categories]
  );

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setModalOpen(true);
  };

  const handleDelete = (cat: Category) => {
    deleteCategory({ id: cat.id, storeId });
  };

  const columns = useMemo(
    () => [
      col.accessor("name", {
        id: "name",
        header: "Name",
        size: 240,
      }),
      col.accessor("sort_order", {
        id: "sort_order",
        header: "Sort order",
        size: 120,
      }),
      col.display({
        id: "actions",
        header: "",
        size: 88,
        cell: ({ row }) => (
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.actionBtn}
              aria-label={`Edit ${row.original.name}`}
              onClick={() => openEdit(row.original)}
            >
              <Pencil size={14} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
              aria-label={`Delete ${row.original.name}`}
              onClick={() => handleDelete(row.original)}
            >
              <Trash2 size={14} aria-hidden="true" />
            </button>
          </div>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [storeId]
  );

  const table = useReactTable({
    data: categories,
    columns,
    state: { sorting, columnPinning: PINNED },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleSave = (values: { name: string; sort_order: number }) => {
    if (editing) {
      updateCategory(
        { id: editing.id, storeId, ...values },
        { onSuccess: () => { setModalOpen(false); setEditing(null); } }
      );
    } else {
      createCategory(
        { storeId, ...values },
        { onSuccess: () => setModalOpen(false) }
      );
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Categories</h1>
        <button
          type="button"
          className={styles.addBtn}
          onClick={() => { setEditing(null); setModalOpen(true); }}
        >
          <Plus size={16} aria-hidden="true" />
          Add category
        </button>
      </div>

      <div className={styles.tableWrap}>
        {categories.length === 0 ? (
          <div className={styles.empty}>
            No categories yet. Add one to get started.
          </div>
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
                <tr key={row.id} className={styles.row}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`${styles.td}${cell.column.id === "sort_order" ? ` ${styles.colNumeric}` : ""}`}
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

      <CategoryModal
        open={modalOpen}
        editing={editing}
        nextSortOrder={nextSortOrder}
        onSave={handleSave}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        isPending={isCreating || isUpdating}
      />
    </div>
  );
}
