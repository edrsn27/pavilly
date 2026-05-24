# Coding Rules

## Next.js

- **Always use `<Link href="...">` from `next/link`** for internal page navigation. Never use `<a href="...">` for routes — it breaks client-side navigation and triggers the `no-html-link-for-pages` lint error.
- `<a>` is only acceptable for hash anchors (`href="#section"`) and external URLs (`href="https://..."`).
- Pages are thin server components — no `"use client"` unless the component has state, effects, or browser APIs.
- **`/` (home page) is SSR** — keep it a server component. No client state.
- **`/dashboard` (all role variants) must be `"use client"`** — dashboard pages use live data polling, charts, and interactive widgets that require client-side rendering.

## Styling

- **CSS Modules + design tokens only.** Every component's styles go in a co-located `ComponentName.module.css`.
- **Never hardcode hex, rgb, or pixel values** in CSS. Use the design tokens defined in `src/app/globals.css` (e.g. `var(--teal-600)`, `var(--space-4)`, `var(--radius-md)`).
- Touch targets: minimum `var(--tap-min)` (44px) everywhere, `var(--tap-pos)` (56px) in the POS terminal.
- Always include a `transform: scale(0.97)` on `:active` for tappable elements.
- Respect `prefers-reduced-motion` — wrap animations in `@media (prefers-reduced-motion: no-preference)` or check the global reset.

## Forms

- **Always use `react-hook-form`** for any form with more than one field. Never manage form state with `useState`.
- Use `mode: "onTouched"` as the default validation strategy — validates on blur, re-validates on change after first error.
- Register rules inline via the `register` options object. No separate validation schema unless complexity warrants it.
- API/server errors go in a separate `useState` string — do not mix them into `react-hook-form`'s error state.

## Tables

- **Always use `@tanstack/react-table` (v8)** for data tables. Never hand-roll `<table>` markup with manual sort/filter state.
- Define columns with `createColumnHelper` and `useMemo` inside the component when cell renderers close over component state (e.g. `setAdjustingItem`); define them outside when they are pure.
- Use `getSortedRowModel()` for sortable columns. Apply pre-filtering to the `data` array (tab filters, search) before passing to `useReactTable` — don't use TanStack's `getFilteredRowModel` for simple UI filters.
- Pin the primary identifier column to the left using a stable `ColumnPinningState` constant (no setter needed). Apply `position: sticky` via a `pinStyle(column)` helper that calls `column.getStart("left")` / `column.getAfter("right")`. Always give pinned `th`/`td` an explicit `background` so content doesn't bleed through on horizontal scroll.
- Mark right-aligned numeric columns with a `RIGHT_COLS` set checked at render time; don't add alignment to column meta or `columnDef`.
- **Always set `size` on every column definition** and apply `style={{ width: column.getSize() }}` on every `th` and `td`. Use `table-layout: fixed` on the table. Set `min-width` on the table to the sum of all column sizes. Without this, the first column expands to fill all visible space on mobile.

## Modals

- Scrollable modal body pattern — the flex chain must be unbroken from the dialog down: `dialog (flex column, max-height: 90dvh)` → `form (flex column, flex: 1, min-height: 0)` → `body (flex: 1, min-height: 0, overflow-y: auto)`. Header and footer get `flex-shrink: 0`. Without `min-height: 0` on each flex ancestor, `overflow-y: auto` never activates.
- **Reset modal state on open with `key`, not `useEffect`** — if a modal needs clean form/error state each time it opens, pass `key={discriminator}` at the call site so React remounts the component instead of resetting state inside an effect. Calling `setState` synchronously inside `useEffect` triggers the React Compiler cascading-render warning. Example: `<MyModal key={activeId ?? "closed"} ... />`.

## Full-viewport layouts inside AppShell

AppShell's `.content` area grows with its content — it does not have a constrained height. A page that needs to fill the full viewport (e.g. the POS terminal) cannot rely on `height: 100%` inside `.content`. Use `position: fixed` anchored to the shell's known dimensions instead:

```css
/* desktop — header 60px, sidebar 240px */
@media (min-width: 768px) {
  .terminal {
    position: fixed;
    top: 60px;
    left: 240px;
    right: 0;
    bottom: 0;
    height: auto; /* override any inherited height */
  }
}
```

This escapes the flex/padding chain entirely without touching AppShell or any other page.

## Components

- Barrel exports: every directory has an `index.ts`. Import through the barrel from outside a feature; direct imports are fine within the same feature.
- Navigation chrome (Header, Sidebar, Footer, AppShell) lives in `src/widgets/`, not `src/features/`.
- Numeric values (prices, quantities, totals) use `font-family: var(--font-numeric)` and `font-variant-numeric: tabular-nums`.
- **`TextTruncate`** (`src/shared/components/TextTruncate`) — use for any text that should truncate with ellipsis and show a tooltip on overflow. Pass `className` to the wrapper to set `max-width`, `font-weight`, `color` (all inherited). The component only shows the tooltip when the text is actually overflowing (checks `scrollWidth > offsetWidth` on hover — no re-render).
