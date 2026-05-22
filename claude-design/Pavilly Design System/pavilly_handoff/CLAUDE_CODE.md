# Claude Code handoff — Pavilly design system → edrsn27/pavilly

This bundle drops the Pavilly design system into your existing Next.js 16 / React 19
repo (`github.com/edrsn27/pavilly`). Your repo uses **CSS Modules + globals.css**
(no Tailwind), so this package is tailored to that.

---

## How to use Claude Code with this bundle

Claude Code is Anthropic's agent that runs in your terminal, inside your repo,
and can read + edit files locally. It's separate from this web product.

### 1 · Install Claude Code (one-time)

```bash
npm install -g @anthropic-ai/claude-code
```

(Or use whichever install method matches your setup — see
[claude.ai/code](https://claude.ai/code) for current install docs.)

### 2 · Unpack this bundle next to your repo

You should have downloaded `pavilly_handoff.zip`. Unpack it somewhere — for
example, your `~/Downloads/pavilly_handoff/` folder. **You don't paste this into
your repo.** Claude Code will read from it.

### 3 · Open your repo in a terminal

```bash
cd path/to/pavilly
claude
```

### 4 · Paste this prompt as your first message

```
I have a design system bundle at ~/Downloads/pavilly_handoff/ that I want you
to integrate into this Next.js repo.

Stack reminder: Next.js 16, React 19, App Router, TypeScript, CSS Modules, no Tailwind.

Please do these steps in order, pausing for me to review after each:

STEP 1 — Replace tokens + assets
  • Replace src/app/globals.css entirely with the file at
    ~/Downloads/pavilly_handoff/_replace_src_app_globals.css
  • Copy ~/Downloads/pavilly_handoff/assets/pavilly-mark.svg,
    pavilly-logo.svg, and pavilly-logo-dark.svg into public/
  • Update src/app/layout.tsx metadata title to "Pavilly — POS that
    disappears" and description to something appropriate
  • Replace src/app/page.tsx with a simple landing page that shows the
    Pavilly wordmark, a heading, and a teal Button — just to prove the
    tokens are wired
  • Run `npm run dev` and verify

STEP 2 — Set up the components folder
  • Create src/components/ui/ and copy in Button.tsx + Button.module.css
    from ~/Downloads/pavilly_handoff/example_components/
  • Install lucide-react for icons: `npm install lucide-react`
  • Create src/components/ui/Icon.tsx that re-exports the Lucide icons
    we'll use, with strokeWidth=1.75 as the brand default

STEP 3 — Port the POS Terminal kit
  • The reference implementation is at
    ~/Downloads/pavilly_handoff/ui_kits/pos_terminal/ — those are
    Babel-standalone JSX files using `Object.assign(window, ...)` pattern;
    you need to convert them to proper TS modules + CSS Modules
  • Build these components in src/components/pos/:
    - Sidebar.tsx, TopBar.tsx, CategoryStrip.tsx
    - ProductGrid.tsx, ProductTile.tsx
    - Cart.tsx, CartRow.tsx, QuantityStepper.tsx
    - PaymentModal.tsx
  • Replace hand-traced window.Icon.* usages with lucide-react imports
  • Replace `kit.css` global styles with per-component .module.css files
  • Mark components that use useState / event handlers with "use client";
    leave the rest as server components
  • Create app/(pos)/page.tsx that composes them into a working terminal

STEP 4 — Port the Manager Mobile kit
  • Reference: ~/Downloads/pavilly_handoff/ui_kits/mobile_manager/
  • Build in src/components/manager/: TabBar, KpiHero, KpiGrid, OrderRow,
    OrdersList, HomeScreen, OrdersScreen, ItemsScreen
  • Create app/(manager)/page.tsx that wires them up
  • The iOS device frame in the reference is just for the design-system
    preview — in the real app, just render mobile-responsive directly

Reference docs in the bundle:
  • README.md — full brand spec (voice, color, type, motion, etc.)
  • colors_and_type.css — the canonical tokens (already in globals.css)
  • ui_kits/*/README.md — kit-specific notes

Rules to follow:
  • Use the CSS custom properties from globals.css for everything — never
    hardcode hex codes in component CSS
  • Tabular numerals on every price/total — use the .numeric helper class
    or font-variant-numeric: tabular-nums
  • Touch targets: 44px minimum, 56px for POS surfaces
  • Press tick: scale(0.97) 80ms ease-out on every tappable element
  • Honor prefers-reduced-motion
  • Use Server Components by default; "use client" only when needed

Start with STEP 1 and show me the diff before moving on.
```

### 5 · Review each step, commit, move on

Claude Code will pause for your approval between steps. Review the diff in
your editor, commit if it looks good, then tell Claude Code to continue.

---

## What's in this bundle

| Path                                            | What it is                              |
| ----------------------------------------------- | --------------------------------------- |
| `README.md`                                     | Pavilly brand spec — voice, color, type, motion, layout rules |
| `colors_and_type.css`                           | Canonical token source (already merged into the replacement globals.css) |
| `_replace_src_app_globals.css`                  | **Replace your `src/app/globals.css` with this entire file**  |
| `assets/pavilly-mark.svg`                       | Storefront mark — copy to `public/`     |
| `assets/pavilly-logo.svg`                       | Wordmark on light — copy to `public/`   |
| `assets/pavilly-logo-dark.svg`                  | Wordmark on dark — copy to `public/`    |
| `example_components/Button.tsx`                 | Reference component using CSS Modules — copy to `src/components/ui/` |
| `example_components/Button.module.css`          | Companion CSS Module                    |
| `ui_kits/pos_terminal/`                         | Full POS terminal reference (Babel JSX — port to TS) |
| `ui_kits/mobile_manager/`                       | Full manager mobile reference (Babel JSX — port to TS) |
| `CLAUDE_CODE.md`                                | This file                               |

---

## Notes specific to your repo

- Your `src/app/layout.tsx` already loads `Geist` and `Geist_Mono` via
  `next/font/google` and exposes them as `--font-geist-sans` /
  `--font-geist-mono`. The replacement `globals.css` reads those vars — **no
  changes to layout.tsx are needed** beyond updating the page metadata.
- Your repo uses CSS Modules (not Tailwind). The reference UI kits in this
  bundle use plain CSS; porting to CSS Modules is straightforward — one
  `.module.css` per component, class names dot-accessed via `styles.btn`,
  etc. See `example_components/Button` for the exact pattern.
- React 19 + Next.js 16 — Server Components by default. Anything with
  `useState`, refs, or event handlers needs `"use client";` at the top.

---

## If something breaks

- **"Cannot find module 'lucide-react'"** → `npm install lucide-react`
- **Fonts look like Arial** → check that `layout.tsx` still has the
  `geistSans.variable` + `geistMono.variable` classes on `<html>`
- **Teal button looks black** → the `--accent` var didn't load; check that
  Claude Code actually replaced `globals.css` and didn't merge into it
- **Hydration mismatch on dark mode** → wrap any client-side theme detection
  in a `useEffect` or use `next-themes`
