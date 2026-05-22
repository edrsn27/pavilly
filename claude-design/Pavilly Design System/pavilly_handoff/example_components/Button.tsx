"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "lg" | "pos";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", size = "md", className, children, ...rest },
  ref,
) {
  const cn = [styles.btn, styles[variant], styles[size], className]
    .filter(Boolean)
    .join(" ");
  return (
    <button ref={ref} className={cn} {...rest}>
      {children}
    </button>
  );
});
