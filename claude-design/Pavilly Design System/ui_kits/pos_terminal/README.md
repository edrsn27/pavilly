# Pavilly POS Terminal · UI Kit

Tablet / browser-resident point-of-sale UI. Designed for a 1280×800 landscape device
(checkout iPad, Square Register, Windows touch terminal). Three-pane layout:

- **Sidebar** (72px) — primary nav
- **Catalog** (flex) — search, category strip, product grid
- **Cart** (420px) — line items, totals, charge button

## Components

| File         | Exports                                                            |
| ------------ | ------------------------------------------------------------------ |
| `Icons.jsx`  | `Icon.*` — Lucide-style 24px line icons                            |
| `Layout.jsx` | `Sidebar`, `TopBar`, `CategoryStrip`                               |
| `Catalog.jsx`| `ProductGrid`, `ProductTile`, plus `CATEGORIES` / `PRODUCTS` data  |
| `Cart.jsx`   | `Cart`, `CartRow` (incl. quantity stepper)                         |
| `Payment.jsx`| `PaymentModal` (select → processing → confirm), `Spinner`          |
| `App.jsx`    | Wires everything together; renders to `#app`                       |

## Interactive demo

`index.html` opens with a pre-populated cart so the visual rhythm is visible at first
glance. From there:

1. Click a product tile → adds to the cart (or increments the existing line)
2. Use the +/− on each cart row to adjust quantity
3. Click **Charge** → payment modal → choose method → spinner → confirm screen
4. After the confirm dismisses, cart is cleared and the terminal returns to "new sale"

## Implementation notes

- Pure browser React (no build step) via Babel standalone — every component sits in
  its own JSX file and exposes itself via `Object.assign(window, …)`. Drop the same
  components into a real Next.js app by converting the window-exports to ES modules.
- All visual tokens come from `colors_and_type.css` at the project root.
- Touch targets: tiles ≥ 168px, cart rows ≥ 56px, charge button 56px tall.
- Numerals: every price + total uses Geist Mono with tabular figures so columns line up.
