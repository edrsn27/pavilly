---
name: pavilly-design
description: Use this skill to generate well-branded interfaces and assets for Pavilly, a modern mobile-first POS (point-of-sale) product. Contains essential design guidelines, colors, typography, fonts, logo, iconography, and UI kit components for prototyping mobile, tablet, browser, and touch-terminal screens.
user-invocable: true
---

# Pavilly Design Skill

Read `README.md` first — it covers brand voice, visual foundations, iconography
rules, and known caveats / substitutions (font, icon library, brand color all
called out where they were defaulted).

Then explore:

- `colors_and_type.css` — all design tokens (palette, type, spacing, radii,
  shadows, motion). Import this file from any new HTML / React artifact.
- `assets/` — logo mark + wordmark light/dark (SVG). Copy out for use.
- `ui_kits/pos_terminal/` — tablet / browser POS checkout kit. JSX components +
  interactive demo. Read `README.md` inside.
- `ui_kits/mobile_manager/` — phone-sized manager dashboard kit. JSX components +
  interactive demo. Read `README.md` inside.
- `preview/` — 20 specimen cards illustrating tokens and components in isolation.
  Useful for understanding the system at a glance.

## When making visual artifacts (slides, mocks, throwaway prototypes)

1. Create a fresh HTML file (don't edit kit demos in place).
2. Link `colors_and_type.css` via `<link rel="stylesheet">` — relative or copied.
3. Copy any logo / icon / image assets you'll reference into your artifact's folder.
4. Read components in the relevant UI kit; copy + simplify the JSX you need.

## When working on production code

1. Read this skill end-to-end so you know what tokens exist.
2. Translate `colors_and_type.css` vars into the project's chosen token format
   (Tailwind theme, CSS modules, Stitches config, etc.).
3. Lift component patterns — touch targets, radii, motion curves — from the kits.
   Don't copy the demo JSX wholesale; build proper components against your stack.

## When invoked with no other guidance

Ask the user what they want to design or build (a screen, a slide, a marketing
page?), what surface (mobile / tablet / browser / terminal?), and whether they
want variations. Then proceed as an expert Pavilly designer producing either an
HTML artifact or production code per their need.
