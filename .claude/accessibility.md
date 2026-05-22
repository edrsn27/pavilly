# Accessibility Rules

## Semantic HTML

- Use the correct element for the job: `<button>` for actions, `<a>` for navigation, `<nav>`, `<main>`, `<header>`, `<footer>`, `<section>`, `<aside>` for landmarks.
- Never use a `<div>` or `<span>` as a clickable element — use `<button>` instead.
- Heading hierarchy must be sequential (`h1` → `h2` → `h3`) with no skipped levels. One `<h1>` per page.

## Interactive elements

- All interactive elements must be keyboard-reachable and operable with Enter/Space.
- Minimum touch/click target size: `var(--tap-min)` (44×44px). POS terminal: `var(--tap-pos)` (56×56px).
- Never remove focus outlines. Style `:focus-visible` with the brand ring (`box-shadow: 0 0 0 3px rgb(13 148 136 / .4)`).
- Disabled states must use `disabled` attribute (not just visual styling) so they are announced by screen readers.

## Images and icons

- Decorative images and icons: `aria-hidden="true"`.
- Meaningful images: descriptive `alt` text.
- Icon-only buttons must have `aria-label` describing the action (e.g. `aria-label="Close cart"`).

## Forms

- Every `<input>`, `<select>`, and `<textarea>` must have an associated `<label>` via `htmlFor` / `id`.
- Use `aria-describedby` to link helper text or error messages to their field.
- Mark required fields with `required` attribute; do not rely on color alone to indicate errors.
- Error messages must be announced — use `role="alert"` or `aria-live="polite"` on error containers.

## Motion

- Always respect `prefers-reduced-motion`. Transitions and animations must be wrapped in `@media (prefers-reduced-motion: no-preference)` or suppressed by the global reset.

## Color and contrast

- Text contrast ratio: minimum 4.5:1 for normal text, 3:1 for large text (≥18px bold / ≥24px regular).
- Never convey information by color alone — pair color with an icon, label, or pattern.
