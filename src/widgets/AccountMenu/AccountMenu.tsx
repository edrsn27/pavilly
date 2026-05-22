"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser, useSignOut } from "@/shared/queries/auth";
import styles from "./AccountMenu.module.css";

function getInitials(fullName: string | undefined, email: string | undefined): string {
  if (fullName?.trim()) {
    const parts = fullName.trim().split(" ");
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0][0].toUpperCase();
  }
  return email?.[0]?.toUpperCase() ?? "?";
}

export function AccountMenu() {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const { mutate: signOut, isPending } = useSignOut();

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fullName = user?.user_metadata?.full_name as string | undefined;
  const email = user?.email;
  const initials = getInitials(fullName, email);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleSignOut = () => {
    signOut(undefined, {
      onSuccess: () => router.push("/login"),
    });
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className={styles.avatar} aria-hidden="true">{initials}</span>
      </button>

      {open && (
        <div className={styles.popup} role="menu">
          <div className={styles.userInfo}>
            <span className={styles.avatarLg} aria-hidden="true">{initials}</span>
            <div className={styles.userText}>
              {fullName && <span className={styles.userName}>{fullName}</span>}
              <span className={styles.userEmail}>{email}</span>
            </div>
          </div>

          <div className={styles.divider} role="separator" />

          <button
            type="button"
            role="menuitem"
            className={styles.menuItem}
            onClick={handleSignOut}
            disabled={isPending}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {isPending ? "Signing out…" : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
}
