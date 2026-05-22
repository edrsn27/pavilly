// Example: a Button component ported from ui_kits/pos_terminal to idiomatic
// Next.js + Tailwind + TS. Use this as the template for porting the rest.

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "lg" | "pos";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:   "bg-accent text-on-accent hover:bg-accent-hover shadow-sm",
  secondary: "bg-surface text-fg-1 border border-border-2 hover:bg-surface-2",
  ghost:     "bg-transparent text-fg-1 hover:bg-surface-2",
  danger:    "bg-danger text-white hover:bg-danger/90",
};

const sizes: Record<Size, string> = {
  md:  "h-11 px-[18px] text-sm rounded-md",
  lg:  "h-13 px-[22px] text-base rounded-md",
  pos: "h-14 px-6 text-base rounded-[14px] min-h-pos", // POS-size: 56px
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = "primary", size = "md", className, children, ...rest }, ref) => (
    <button
      ref={ref}
      className={clsx(
        "inline-flex items-center justify-center gap-2",
        "font-semibold transition-[transform,background] duration-150 ease-out",
        "active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
        "focus-visible:outline-none focus-visible:shadow-focus",
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  ),
);
Button.displayName = "Button";
