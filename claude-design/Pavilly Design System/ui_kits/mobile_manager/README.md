# Pavilly Manager · Mobile UI Kit

Owner / manager phone app — what the store owner reaches for between transactions.
Shown inside an iOS device frame (the iOS chrome is from the starter component;
all screen content is Pavilly's design).

Three screens, switched via the bottom tab bar:

- **Home** — greeting, today's sales hero card with sparkline, KPI grid, recent orders
- **Orders** — full searchable orders list with status badges
- **Items** — catalog with stock state (in / low / out)
- **Sell** (FAB) — would open a new-sale flow on a real device (stub)
- **Me** — settings stub (stub)

## Components

| File         | Exports                                                |
| ------------ | ------------------------------------------------------ |
| `ios-frame.jsx` | `IOSDevice` (starter component — iOS chrome only)   |
| `TabBar.jsx`    | `MIcon.*`, `TabBar`                                  |
| `Screens.jsx`   | `HomeScreen`, `OrdersScreen`, `ItemsScreen`, `OrderRow` + sample data |
| `App.jsx`       | Wires tab state + iOS frame                          |

## Tab bar pattern

5 slots; the middle is a 44px FAB that bumps 10px above the bar — the only
control with a colored fill, since "new sale" is the action the owner will
reach for most often. Other tabs use 1.75-stroke Lucide-style outlines that
fill in to the brand teal when active.

Glass background on the tab bar uses iOS-style backdrop-filter blur so content
scrolls behind it without losing legibility.
