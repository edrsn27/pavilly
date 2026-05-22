"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { useCreateStore, useUpdateStore } from "@/shared/queries/stores";
import type { Store } from "@/shared/queries/stores";
import styles from "./StoreModal.module.css";

interface StoreFields {
  name: string;
  description: string;
  logo_url: string;
}

interface StoreModalProps {
  open: boolean;
  onClose: () => void;
  /** Pass an existing store to switch to update mode */
  store?: Store;
}

export function StoreModal({ open, onClose, store }: StoreModalProps) {
  const isUpdate = !!store;
  const { mutate: createStore, isPending: creating } = useCreateStore();
  const { mutate: updateStore, isPending: updating } = useUpdateStore();
  const isPending = creating || updating;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<StoreFields>({ mode: "onTouched" });

  useEffect(() => {
    if (open) {
      reset({
        name: store?.name ?? "",
        description: store?.description ?? "",
        logo_url: store?.logo_url ?? "",
      });
    }
  }, [open, store, reset]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const onSubmit = (data: StoreFields) => {
    const payload = {
      name: data.name.trim(),
      description: data.description.trim() || undefined,
      logo_url: data.logo_url.trim() || undefined,
    };

    if (isUpdate) {
      updateStore(
        { id: store.id, ...payload },
        {
          onSuccess: onClose,
          onError: (err) => setError("root", { message: err instanceof Error ? err.message : "Failed to update store." }),
        }
      );
    } else {
      createStore(payload, {
        onSuccess: onClose,
        onError: (err) => setError("root", { message: err instanceof Error ? err.message : "Failed to create store." }),
      });
    }
  };

  return (
    <div className={styles.backdrop}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="store-modal-title"
      >
        {/* Header */}
        <div className={styles.header}>
          <h2 id="store-modal-title" className={styles.title}>
            {isUpdate ? "Edit store" : "Create your store"}
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={styles.body}>

            {errors.root && (
              <div className={styles.errorBanner} role="alert">
                {errors.root.message}
              </div>
            )}

            <div className={styles.field}>
              <label htmlFor="store-name" className={styles.label}>
                Store name <span className={styles.required} aria-hidden="true">*</span>
              </label>
              <input
                id="store-name"
                type="text"
                placeholder="e.g. Aling Nena's Sari Sari Store"
                autoFocus
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "store-name-error" : undefined}
                className={`${styles.input}${errors.name ? ` ${styles.inputError}` : ""}`}
                {...register("name", { required: "Store name is required." })}
              />
              {errors.name && (
                <span id="store-name-error" className={styles.fieldError} role="alert">
                  {errors.name.message}
                </span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="store-description" className={styles.label}>
                Description <span className={styles.labelHint}>(optional)</span>
              </label>
              <textarea
                id="store-description"
                rows={3}
                placeholder="Short description of your store…"
                className={styles.textarea}
                {...register("description")}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="store-logo" className={styles.label}>
                Logo URL <span className={styles.labelHint}>(optional)</span>
              </label>
              <input
                id="store-logo"
                type="url"
                placeholder="https://…"
                className={styles.input}
                {...register("logo_url")}
              />
            </div>

          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={isPending}>
              {isPending
                ? isUpdate ? "Saving…" : "Creating…"
                : isUpdate ? "Save changes" : "Create store"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
