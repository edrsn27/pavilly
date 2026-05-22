# Coding Rules

## Next.js

- **Always use `<Link href="...">` from `next/link`** for internal page navigation. Never use `<a href="...">` for routes — it breaks client-side navigation and triggers the `no-html-link-for-pages` lint error.
- `<a>` is only acceptable for hash anchors (`href="#section"`) and external URLs (`href="https://..."`).
- Pages are thin server components — no `"use client"` unless the component has state, effects, or browser APIs.

## Styling

- **CSS Modules + design tokens only.** Every component's styles go in a co-located `ComponentName.module.css`.
- **Never hardcode hex, rgb, or pixel values** in CSS. Use the design tokens defined in `src/app/globals.css` (e.g. `var(--teal-600)`, `var(--space-4)`, `var(--radius-md)`).
- Touch targets: minimum `var(--tap-min)` (44px) everywhere, `var(--tap-pos)` (56px) in the POS terminal.
- Always include a `transform: scale(0.97)` on `:active` for tappable elements.
- Respect `prefers-reduced-motion` — wrap animations in `@media (prefers-reduced-motion: no-preference)` or check the global reset.

## Components

- Barrel exports: every directory has an `index.ts`. Import through the barrel from outside a feature; direct imports are fine within the same feature.
- Navigation chrome (Header, Sidebar, Footer, AppShell) lives in `src/widgets/`, not `src/features/`.
- Numeric values (prices, quantities, totals) use `font-family: var(--font-numeric)` and `font-variant-numeric: tabular-nums`.
