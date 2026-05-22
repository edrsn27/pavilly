// Pavilly — Tailwind 3 config (drop in as tailwind.config.ts).
// Tailwind 4 users don't need this file — Tailwind 4 picks up CSS vars
// directly from globals.css.

import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand ramps — full scale exposed so you can use e.g. bg-teal-100
        teal: {
          50:  "var(--pavilly-teal-50)",
          100: "var(--pavilly-teal-100)",
          200: "var(--pavilly-teal-200)",
          300: "var(--pavilly-teal-300)",
          400: "var(--pavilly-teal-400)",
          500: "var(--pavilly-teal-500)",
          600: "var(--pavilly-teal-600)",
          700: "var(--pavilly-teal-700)",
          800: "var(--pavilly-teal-800)",
          900: "var(--pavilly-teal-900)",
          950: "var(--pavilly-teal-950)",
        },
        sage: {
          50:  "var(--pavilly-sage-50)",
          100: "var(--pavilly-sage-100)",
          200: "var(--pavilly-sage-200)",
          300: "var(--pavilly-sage-300)",
          400: "var(--pavilly-sage-400)",
          500: "var(--pavilly-sage-500)",
          600: "var(--pavilly-sage-600)",
          700: "var(--pavilly-sage-700)",
        },
        olive: {
          100: "var(--pavilly-olive-100)",
          300: "var(--pavilly-olive-300)",
          500: "var(--pavilly-olive-500)",
        },
        cream: {
          50:  "var(--pavilly-cream-50)",
          100: "var(--pavilly-cream-100)",
        },
        ink: {
          0:   "var(--pavilly-ink-0)",
          25:  "var(--pavilly-ink-25)",
          50:  "var(--pavilly-ink-50)",
          100: "var(--pavilly-ink-100)",
          200: "var(--pavilly-ink-200)",
          300: "var(--pavilly-ink-300)",
          400: "var(--pavilly-ink-400)",
          500: "var(--pavilly-ink-500)",
          600: "var(--pavilly-ink-600)",
          700: "var(--pavilly-ink-700)",
          800: "var(--pavilly-ink-800)",
          900: "var(--pavilly-ink-900)",
          950: "var(--pavilly-ink-950)",
        },
        // Semantic tokens — prefer these in component code
        bg:        "var(--bg)",
        surface:   "var(--surface)",
        "surface-2": "var(--surface-2)",
        "surface-3": "var(--surface-3)",
        "fg-1":    "var(--fg-1)",
        "fg-2":    "var(--fg-2)",
        "fg-3":    "var(--fg-3)",
        "fg-accent": "var(--fg-accent)",
        accent:    "var(--accent)",
        "accent-hover":   "var(--accent-hover)",
        "accent-pressed": "var(--accent-pressed)",
        "accent-soft":    "var(--accent-soft)",
        "on-accent":      "var(--on-accent)",
        "border-1": "var(--border-1)",
        "border-2": "var(--border-2)",
        success: { DEFAULT: "var(--pavilly-success)", fg: "var(--pavilly-success-fg)", bg: "var(--pavilly-success-bg)" },
        warning: { DEFAULT: "var(--pavilly-warning)", fg: "var(--pavilly-warning-fg)", bg: "var(--pavilly-warning-bg)" },
        danger:  { DEFAULT: "var(--pavilly-danger)",  fg: "var(--pavilly-danger-fg)",  bg: "var(--pavilly-danger-bg)" },
        info:    { DEFAULT: "var(--pavilly-info)",    fg: "var(--pavilly-info-fg)",    bg: "var(--pavilly-info-bg)" },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        sm: "8px", md: "12px", lg: "16px", xl: "20px", "2xl": "28px",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        focus: "var(--shadow-focus)",
      },
      transitionTimingFunction: {
        out:    "var(--ease-out)",
        spring: "var(--ease-spring)",
      },
      minHeight: {
        tap: "44px",
        pos: "56px",
      },
    },
  },
  plugins: [],
} satisfies Config;
