# Importing Pavilly into a Next.js repo

Step-by-step. Target stack: **Next.js 14+ App Router, React 18, Tailwind 3 or 4, TypeScript**.

The kit files live under `nextjs/` in this project — copy them into your repo at
the listed paths.

---

## 1 · Copy the tokens (5 min)

| From this project              | To your Next.js repo            |
| ------------------------------ | ------------------------------- |
| `nextjs/globals.css`           | `app/globals.css`               |
| `nextjs/tailwind.config.ts`    | `tailwind.config.ts` (root)     |
| `nextjs/fonts.ts`              | `app/fonts.ts`                  |
| `assets/pavilly-mark.svg`      | `public/pavilly-mark.svg`       |
| `assets/pavilly-logo.svg`      | `public/pavilly-logo.svg`       |
| `assets/pavilly-logo-dark.svg` | `public/pavilly-logo-dark.svg`  |

> **Tailwind 4?** Skip `tailwind.config.ts` — Tailwind 4 reads the CSS vars from
> `globals.css` directly. The `@theme` block isn't shown but Tailwind v4
> automatically picks up `--pavilly-*` if you prefix them appropriately. Easiest:
> stick with Tailwind 3 + the provided config for now.

---

## 2 · Wire fonts into `app/layout.tsx`

```tsx
import { sans, mono } from "./fonts";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

That's it — `--font-sans` and `--font-mono` are now available globally and
`font-sans` / `font-mono` Tailwind classes work.

---

## 3 · Dark mode (optional)

Install [`next-themes`](https://github.com/pacocoursey/next-themes) and add a
`<ThemeProvider attribute="class">` in your root layout. The CSS file already
targets `.dark` — no other wiring needed.

```bash
npm install next-themes
```

```tsx
// app/providers.tsx (client component)
"use client";
import { ThemeProvider } from "next-themes";
export function Providers({ children }: { children: React.ReactNode }) {
  return <ThemeProvider attribute="class" defaultTheme="system">{children}</ThemeProvider>;
}
```

---

## 4 · Icons — use `lucide-react`

The hand-traced icons in `ui_kits/*/Icons.jsx` exist only to keep the kits
self-contained for browser-Babel preview. **In your real app, use the package:**

```bash
npm install lucide-react
```

```tsx
import { Home, ShoppingCart, Receipt } from "lucide-react";

<ShoppingCart size={22} strokeWidth={1.75} />
```

The hand-traced names map 1:1 (`Icon.Cart` → `ShoppingCart`, `Icon.Receipt` →
`Receipt`, etc.). Stroke width **1.75** is the brand spec.

---

## 5 · Port the components

The JSX in `ui_kits/` uses a window-globals pattern (necessary for the
browser-Babel preview environment). To port to Next.js:

1. **Convert to ES modules** — strip the `Object.assign(window, ...)` lines and
   add `export` to each component.
2. **Swap icons** — replace `<window.Icon.Cart />` with `import { ShoppingCart } from "lucide-react"`.
3. **Replace `window.*` references** — turn into normal imports.
4. **Pull styles out of the kit CSS** — most rules map cleanly to Tailwind
   utilities; see `nextjs/example-Button.tsx` for the pattern.

Suggested file structure inside your Next.js app:

```
app/
  layout.tsx
  globals.css
  fonts.ts
  (pos)/
    page.tsx              # POS terminal route — composed from components below
components/
  ui/
    Button.tsx            # see nextjs/example-Button.tsx
    Input.tsx
    Card.tsx
    Stepper.tsx
    Badge.tsx
    PriceTag.tsx          # numeric / tabular-nums wrapper
  pos/
    Sidebar.tsx
    TopBar.tsx
    CategoryStrip.tsx
    ProductGrid.tsx
    ProductTile.tsx
    Cart.tsx
    CartRow.tsx
    PaymentModal.tsx
  manager/
    KpiHero.tsx
    KpiGrid.tsx
    OrderRow.tsx
    OrdersList.tsx
    TabBar.tsx
```

---

## 6 · Tabular numerals for prices

Anywhere you render a price or total, use the `numeric` helper class (defined
in `globals.css`) or the Tailwind utilities:

```tsx
<span className="font-mono tabular-nums tracking-tight">${total.toFixed(2)}</span>
// or shorthand:
<span className="numeric">${total.toFixed(2)}</span>
```

This is non-negotiable — receipt columns and totals must line up regardless of
which digits appear.

---

## 7 · Touch targets

Three sizes baked into the Tailwind config:

| Class           | Min-height | Use                              |
| --------------- | ---------- | -------------------------------- |
| `min-h-tap`     | 44px       | Mobile / browser buttons, rows   |
| `min-h-pos`     | 56px       | POS terminal — cashiers tap fast |
| (custom)        | 72px       | Numeric keypad keys              |

Don't go below `min-h-tap` for anything tappable.

---

## 8 · SSR safety

The kit demos are entirely client-side. When porting:

- Components with `useState`, event handlers, etc. → mark with `"use client";`
- Layout chrome (sidebars, tab bars, lists from static data) → leave as server
  components
- Catalog data, today's-sales KPIs, recent orders → fetch in server components
  (`async function Page()`) and pass props down

---

## Quick check — does the install work?

After step 2, drop this into `app/page.tsx`:

```tsx
import { Button } from "@/components/ui/Button";

export default function Page() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-bg">
      <div className="bg-surface border border-border-1 rounded-lg shadow-sm p-8 flex flex-col gap-4 items-start">
        <h1 className="text-3xl font-semibold text-fg-1">Pavilly is wired up</h1>
        <p className="text-fg-2">Teal accents, warm-stone neutrals, tabular numerals.</p>
        <Button>Charge <span className="numeric">$48.20</span></Button>
      </div>
    </main>
  );
}
```

If you see a teal button on a cream background — you're good.

---

## Need a fully ported scaffold?

I can generate the full set of ported components (Button, Input, Cart, etc.)
into the `nextjs/` folder if you want a copy-paste-ready handoff package. Just
ask — "port the POS components to Next.js" — and I'll do it.
