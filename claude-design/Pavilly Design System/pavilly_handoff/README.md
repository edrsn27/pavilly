# Pavilly Design System

> A modern, mobile-first design system for **Pavilly** — a point-of-sale platform for small retail and hospitality businesses. Built for cashiers, store owners, and the screens between them: phones, tablets, browser dashboards, and dedicated touch terminals.

The palette is drawn directly from the user-supplied Color Hunt selection
([35858E · 7DA78C · C2D099 · E6EEC9](https://colorhunt.co/palette/35858E7DA78CC2D099E6EEC9))
— deep teal as primary, sage as secondary, olive + cream as soft highlights, sitting
on a warm-stone neutral grayscale.

No codebase, Figma, or brand assets were provided beyond the palette and the name
"Pavilly". Everything else (typeface choice, logo mark, voice examples, icon set)
is an opinionated first proposal — see **Caveats** at the bottom for the flagged
substitutions.

---

## Product surfaces

Pavilly is a multi-device product. This system covers the two surfaces that account
for ~90% of usage:

| Surface              | Where it lives                          | What it does                                                  |
| -------------------- | --------------------------------------- | ------------------------------------------------------------- |
| **POS Terminal**     | Tablet, browser, dedicated touch device | The actual checkout — catalog, cart, take payment             |
| **Manager Mobile**   | Phone (iOS / Android)                   | Owner's dashboard — sales, orders, items, customers           |

Future surfaces this system is sized for but does not yet ship:

- **Manager Web** (sidebar + multi-pane desktop dashboard — reuses POS Terminal chrome)
- **Customer-facing display** (kitchen / counter receipt mirror)
- **Marketing site** (no opinion yet — picks up the brand fonts + palette only)

---

## Index

| Path                              | Contents                                                                  |
| --------------------------------- | ------------------------------------------------------------------------- |
| `README.md`                       | This file                                                                 |
| `NEXTJS.md`                       | Step-by-step guide to wire this system into a Next.js codebase            |
| `SKILL.md`                        | Agent-skill manifest for Claude Code / similar                            |
| `colors_and_type.css`             | All foundation tokens — palette, type, spacing, radii, shadows, motion    |
| `nextjs/`                         | Drop-in Next.js files — `globals.css`, `tailwind.config.ts`, `fonts.ts`, example component |
| `assets/`                         | Logo mark, wordmark light, wordmark dark (SVG)                            |
| `preview/`                        | 22 design-system cards rendered as small HTML specimens                   |
| `ui_kits/pos_terminal/`           | Tablet POS UI kit — JSX components + interactive demo                     |
| `ui_kits/mobile_manager/`         | Mobile manager UI kit — JSX components + interactive demo                 |
| `fonts/`                          | Empty — fonts pulled from Google Fonts (see below)                        |

---

## Brand voice & content fundamentals

Pavilly's voice is **a co-worker, not a cashier-of-itself**. Real, plain, and never
fussy. The audience is busy: cashiers with a line out the door, owners checking
sales between meetings.

| Pillar         | Rule                                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Person**     | "you" for the user. Pavilly speaks in the **first person plural ("we")** only when a human is on the loop (support). |
| **Casing**     | Sentence case **everywhere** — buttons, headers, settings rows. Title Case feels stuffy.                            |
| **Length**     | A button label is 1–3 words. A page header is 1–4. Helper text under fields is one sentence.                        |
| **Numbers**    | Always with currency symbol (`$48.20`, not `48.20 USD`). Tabular figures so columns align.                           |
| **Errors**     | What happened, what to do. Never "Something went wrong." Try "Card declined — ask for a different card."             |
| **Empty states** | One line. Tells the user what they can do. "Cart is empty / Tap a product to start a sale."                       |
| **Confirmations** | Past tense, positive. "Receipt emailed to ada@…" — not "Email will be sent."                                     |

**No** marketing fluff inside the product. No "Awesome!" or "Oops!". No exclamation
marks except in literal error toasts where danger is real. No emoji in UI copy
(emoji is used as a *placeholder asset* for product images — see Iconography).

### Tone calibration — examples

| Don't                                          | Do                                                       |
| ---------------------------------------------- | -------------------------------------------------------- |
| "Awesome! Your order was placed successfully." | "Paid — $48.20 · Visa •••• 4242"                         |
| "Oops! Something went wrong."                  | "Card declined — try another card or accept cash."       |
| "Please enter a valid email address."          | "That doesn't look like a complete email."               |
| "Are you sure you want to delete this order?"  | "Delete order #A2049? You can refund it instead."        |
| "No items found"                               | "Nothing matches 'crossiant'. Try checking the spelling." |

---

## Visual foundations

### Color

- **Primary — Teal `#35858E`.** Calm, confident, professional. Used on charge buttons,
  the FAB, focus rings, the active tab indicator. The 11-step ramp goes from
  `#ecf3f4` (50) down to `#0a1b1d` (950) — see the **Color · brand teal** card.
  **Used sparingly** — teal is the loudest hue in the system. On a busy screen, < 10%
  of pixels.
- **Secondary — Sage `#7DA78C`.** Doubles as the success color and the soft secondary
  fill. Pairs the success badge, sparkline strokes, "paid" status pills, and the
  pale background of green icon tiles.
- **Highlight — Olive `#C2D099`.** The accent dot inside the mark, soft inline
  highlights, optional pill backgrounds.
- **Soft surface — Cream `#E6EEC9` / `#faf9ee`.** Used as the page background
  (`--bg`) so the system never feels stark-white. Sits beneath white cards for a
  warm, paper-like rhythm.
- **Neutrals — warm-stone grayscale.** Slightly warm, slightly desaturated to sit
  with the teal + sage without going cold. 13 steps `0` (white) → `950` (near-black).
  Most of the system lives here.
- **Semantic** — success (sage) / warning (warm amber `#c2820c`) / danger
  (muted terracotta-red `#b85050`) / info (teal). Each comes in a *bg* (soft tint)
  and *fg* (legible text) pair. Pills use both; full backgrounds use just the bg.
- **Dark mode** is a first-class theme. Toggle via `[data-theme="dark"]` on any
  ancestor. Token names stay identical (`--surface`, `--fg-1`, etc.) — only their
  values flip. In dark mode the brand brightens to teal-300 / -400 to keep contrast.

### Typography

- **UI:** [Geist](https://vercel.com/font) — geometric sans, designed for software.
  Used for everything you can read.
- **Numerals:** [Geist Mono](https://vercel.com/font) — tabular figures so prices,
  totals, and receipt columns line up regardless of digit width. Used for every
  price, totaling number, SKU, order ID, timestamp.
- **Scale:** 8 steps from `2xs` (11px) up to `6xl` (64px) — the 6xl exists for
  payment-total displays only.
- **Letter-spacing:** display sizes get a touch of optical tightening (-0.02 → -0.03em);
  body text uses the font's defaults. Numerals are -0.01em across all sizes.
- **Min sizes:** body never below 14px; touch-target labels never below 13px.

### Spacing

A 4-pixel base scale, 11 steps from `space-1` (4px) to `space-20` (80px). Pavilly is
**spacious** — 24px gutters on tablet, 16–22px on mobile. Cards breathe.

**Touch targets:**
- Mobile / browser: 44px minimum (`--tap-min`)
- POS terminal: 56px (`--tap-pos`) — cashiers tap fast and inaccurately
- Numeric keypad: 72px (`--tap-keypad`) — pressed hundreds of times a day

### Radii

`xs:4 sm:8 md:12 lg:16 xl:20 2xl:28 full:∞`

- Inputs and small chips → `sm`
- Buttons, list rows, segmented controls → `md`
- Cards, panes, list containers → `lg`
- Sheets, modals → `xl`
- POS product tiles, FAB, payment-amount card → `2xl` — the visually loudest radii,
  reserved for the things you actually touch

### Elevation

Five tiers — `xs, sm, md, lg, xl` — all **low-contrast**, multi-layer shadows
biased toward downward motion. No colored shadows, no hard drops. Cards rest on
`sm`. Hover bumps to `md`. Modals get `xl`. Dark theme tightens shadow alpha
~3× to compensate for the darker background.

### Borders

Hairline `1px solid var(--border-1)` is the default. Borders only show on:
- Cards and panes (always)
- Inputs at rest (yes); inputs focused (`2px` teal + 3px ring)
- Selected pay-method tiles (`2px` teal)

Never: borders around buttons (except secondary), badges, or full sections.

### Motion

Subtle, fast, purposeful. Four primitives:

| Token             | Curve                      | When                                  |
| ----------------- | -------------------------- | ------------------------------------- |
| **Press tick**    | `scale(0.97)` 80ms ease-out | Every tap of every button             |
| **Confirm pop**   | 320ms ease-spring          | Payment confirmed, item scanned       |
| **Slide-up**      | translateY(8→0) 220ms      | Toasts, sheets, modals appearing      |
| **Fade**          | opacity 220ms              | Page transitions                      |

Honor `prefers-reduced-motion` everywhere — pop and slide collapse to fade.

### Hover & press states

- **Hover (mouse):** background steps one surface darker (`surface` → `surface-2`).
  Brand-fill buttons darken to `accent-hover` (teal 600). Cards lift shadow `sm → md`.
- **Press (touch + mouse):** uniform 97% scale shrink for 80ms. No color flash
  (the scale is enough feedback and is faster than any color change).
- **Focus (keyboard):** 3px teal ring (`--shadow-focus`). Always visible on
  `:focus-visible`.

### Backgrounds & imagery

- **No loud gradients** as page backgrounds — solid cream + surface tokens only.
- **One exception:** the payment amount card and KPI hero card use the near-black
  ink with a soft radial teal glow as decoration. Used sparingly.
- **Product images** are placeholder gradient tiles in this version of the
  system (see Caveats). Real product imagery should be **square, padded with
  margin, and shot on a clean surface** — never bleed to edge of tile.
- **No patterns, no textures, no illustrations** in this iteration. The system is
  pure UI; brand "expression" lives in motion and the careful use of color.

### Transparency & blur

Used in exactly two places:
1. **Bottom tab bar** on mobile — semi-transparent surface with `backdrop-filter:
   blur(12px) saturate(180%)` so content scrolls behind without losing legibility.
2. **Modal overlay** — `rgba(17,17,14,0.45)` dim, no blur. The modal itself is
   fully opaque.

Everywhere else: opaque surfaces. No glass cards stacked on glass cards.

### Layout rules

- **POS Terminal:** fixed three-pane shell. Sidebar (72px), catalog (flex),
  cart (420px). Never collapses on tablet+.
- **Mobile:** single column, full-bleed sections separated by 16–22px gutters.
  Bottom tab bar is fixed; everything above scrolls under it.
- **Section rhythm:** section title → cards/list → next section title. Section
  titles use `text-md` (16px) semibold, not eyebrow caps — they're working
  labels, not graphic elements.

---

## Iconography

**Pavilly uses [Lucide](https://lucide.dev) — 24px, 1.75-stroke, currentColor.**

Reasons: MIT-licensed, deep coverage (1000+ glyphs), neutral-modern stroke shape
that pairs with Geist. A small hand-traced subset lives in `ui_kits/*/Icons.jsx`
to keep the kits self-contained; the rest of the project should pull Lucide via
its React or web-component package.

> ⚠️ **Substitution flag.** No icon library was specified in the brief. Lucide was
> chosen as the closest modern-clean line-icon match. If Pavilly has its own glyph
> library (or prefers Heroicons, Phosphor, etc.), swap by changing the import in
> `ui_kits/*/Icons.jsx` — every component already takes `size` and inherits
> `currentColor`, so the swap is one-line per icon.

- **No emoji in UI copy.** Emoji is used **only as a placeholder asset** for
  product imagery (the colorful coffee-cup / croissant tiles in the demo) until
  real photography ships. Replace with real product images on first real catalog.
- **No unicode characters as icons.** Use a real Lucide glyph (or extend `Icons.jsx`).
- **No raster icons.** Lucide ships as inline SVG; that's what we use.

### Assets in `assets/`

| File                    | Use                                  |
| ----------------------- | ------------------------------------ |
| `pavilly-mark.svg`      | App icon, sidebar logo, favicon      |
| `pavilly-logo.svg`      | Wordmark on light surfaces           |
| `pavilly-logo-dark.svg` | Wordmark on dark surfaces            |

The mark is a small **sari-sari storefront**: a teal soft-cornered square holding
a scalloped white tarp awning (with sage + olive stripes), bold white **PV** signage
in the counter window, and an olive counter sill. It's a direct nod to the small
neighborhood retail that Pavilly serves — the people running the actual tills.

---

## Fonts

Loaded via Google Fonts (`@import` at the top of `colors_and_type.css`):

- **Geist** — weights 300 / 400 / 500 / 600 / 700
- **Geist Mono** — weights 400 / 500 / 600 / 700

> ⚠️ **Substitution flag.** The brief did not specify a typeface. Geist was chosen
> because (a) it's an open, modern, designed-for-software sans, (b) Pavilly is
> described as a Next.js app and Geist ships with Vercel's stack, (c) the Geist
> Mono variant solves the tabular-numeric problem for prices/totals out of the
> box. **If Pavilly has another typeface**, drop ttf/woff2 files into `fonts/`
> and swap the `@import` line for `@font-face` declarations.

---

## Caveats — please iterate with me

You've now given me the brand name and palette — the system applies both. The
following are still defaulted and worth a sanity-check:

1. **Logo mark** — a sari-sari storefront with **PV** monogram in the window,
   scalloped striped awning, olive counter. Iterate on the stripe colors, awning
   silhouette, or PV letterform weight if you want a different read.
2. **Typeface (Geist + Geist Mono)** — see substitution flag above. Flag any
   pre-existing brand font and we'll swap.
3. **Product imagery** — emoji placeholders. Replace with real photos when
   available.
4. **Icon library** — Lucide. Swap as above.
5. **Semantic colors** — warning `#c2820c` (warm amber) and danger `#b85050` (muted
   terracotta-red) are tuned to harmonize with the earth palette. If you want
   louder warning/danger (closer to traditional amber `#f59e0b` / red `#ef4444`),
   change the `--pavilly-warning-*` and `--pavilly-danger-*` ramps in
   `colors_and_type.css`.
6. **Tone-of-voice examples** — written from scratch. Calibrate against any
   existing copy you have and the dictionary will tighten fast.

**Please tell me which of the above are right, wrong, or "yeah but"** — that's
the next move.
