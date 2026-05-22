# Project Structure — AI Context

**Pavilly** is a multi-vendor POS web app for a sari sari store. Vendors register stalls, manage their own products and inventory, and process sales through the POS terminal.

Architecture follows a **Feature / Screen / Widget / Shared** layering. New code goes into the deepest appropriate layer — shared utilities belong in `shared/`, feature-specific logic in `features/`, thin page wrappers in `screens/`.

---

## Top-level layout

```
src/
├── app/                    ← Next.js App Router (pages, layouts, providers)
├── config/                 ← Environment config (clientConfig)
├── features/               ← Self-contained product features
├── interfaces/             ← Domain TypeScript types (not UI types)
├── navigation/             ← Routes object + navigation hooks/wrappers
├── screens/                ← Thin page-level wrappers (assemble features)
├── shared/                 ← Cross-feature reusables
└── widgets/                ← Standalone embeddable UI blocks
```

> **Design system** lives in `claude-design/Pavilly Design System/`. Tailwind config, fonts, and global CSS are in `claude-design/.../nextjs/` — copy them into `src/` during setup.

---

## `src/app/` — Next.js routing

```
app/
├── layout.tsx              ← root layout (fonts, global CSS, providers)
├── providers.tsx           ← QueryClient, state, theme
├── (auth)/                 ← unauthenticated pages
│   └── login/
│       └── page.tsx
├── (admin)/                ← admin-only pages (store owner / manager)
│   ├── layout.tsx          ← admin auth gate + AppShell (Sidebar + Header)
│   ├── dashboard/
│   │   └── page.tsx
│   ├── vendors/
│   │   ├── page.tsx        ← vendor list
│   │   └── [id]/
│   │       └── page.tsx    ← vendor detail / edit
│   ├── products/
│   │   └── page.tsx        ← all products across vendors
│   ├── transactions/
│   │   └── page.tsx        ← full transaction history
│   └── reports/
│       └── page.tsx
├── (vendor)/               ← vendor-specific pages
│   ├── layout.tsx          ← vendor auth gate + AppShell (Sidebar + Header)
│   ├── dashboard/
│   │   └── page.tsx
│   ├── products/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── inventory/
│   │   └── page.tsx
│   └── transactions/
│       └── page.tsx
└── (pos)/                  ← POS terminal (vendor + cashier)
    ├── layout.tsx          ← fullscreen POS layout, auth gate
    └── page.tsx            ← POS terminal
```

Pages are **thin server components** — prefetch data, then delegate to a Screen.

```tsx
// app/(admin)/vendors/[id]/page.tsx
const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  return (
    <PrefetchQuery options={[vendorQueryOptions(id)]}>
      <VendorDetailScreen />
    </PrefetchQuery>
  )
}
```

---

## `src/features/` — product features

Each feature is self-contained. Features do not import from other features.

```
features/
├── auth/               ← LoginForm, session management, role guards
├── dashboard/          ← Summary cards, revenue, quick stats
├── inventory/          ← Stock levels, low-stock alerts, restock
├── notifications/      ← Toast notifications
├── pos/                ← POS terminal: product grid, cart, checkout, payment
├── products/           ← Product catalog: add, edit, search, categories
├── reports/            ← Sales and inventory reports, charts
├── transactions/       ← Transaction list, receipt detail, refunds
└── vendors/            ← Vendor registration, profiles, stall management
```

### Feature internal structure

```
features/my-feature/
├── index.ts                    ← barrel export (only what screens/pages need)
├── MyFeature.tsx               ← main component
├── MyFeature.types.ts          ← feature-local types
├── MyFeature.hooks.ts          ← feature-local hooks
├── MyFeature.utils.ts          ← feature-local utilities
├── MyFeature.const.ts          ← feature-local constants
├── MyFeature.mappers.ts        ← data → view model transformations
└── components/                 ← sub-components (not exported from feature barrel)
    ├── FeaturePart/
    └── ...
```

Styling uses **CSS Modules + design tokens**. Each component's styles live in a co-located `.module.css` file. All colors, spacing, radii, and motion values come from CSS custom properties defined in `src/app/globals.css` — never hardcode hex or raw pixel values in component CSS.

---

## `src/screens/` — page-level assemblies

Screens are thin client components that compose features. They read data from hooks — no props from the server.

```
screens/
├── DashboardScreen/        ← admin or vendor dashboard
├── PosScreen/              ← POS terminal (cart + product grid)
├── ProductsScreen/         ← product listing + filters
├── TransactionsScreen/     ← transaction history + search
├── VendorDetailScreen/     ← vendor profile + their products
├── VendorsScreen/          ← vendor list (admin)
└── ...
```

If a page renders only a single feature, skip the screen and render the feature inline in the page.

---

## `src/widgets/` — standalone embeddable blocks

UI blocks that appear on multiple pages with no feature dependency. Navigation chrome lives here.

```
widgets/
├── AppShell/           ← root layout wrapper (composes Sidebar + Header)
├── Header/             ← top bar (user menu, store name, notifications bell)
├── Sidebar/            ← side navigation (role-aware links)
├── Footer/             ← bottom bar (used in POS / auth layouts)
├── RevenueChart/       ← revenue over time chart
├── StockAlertBadge/    ← low-stock indicator
└── SummaryCard/        ← stat card (total sales, orders, etc.)
```

---

## `src/shared/` — cross-feature reusables

```
shared/
├── api/                ← callApi, ApiError, auth helpers
├── atoms/              ← global state atoms (authAtom, cartAtom, ...)
├── components/         ← shared UI components
│   ├── PrefetchQuery/
│   ├── Providers/
│   ├── RoleGuard/      ← role-based access wrapper
│   └── ...
├── hooks/              ← shared React hooks
│   ├── useCurrentUser/
│   ├── useRole/
│   └── ...
├── queries/            ← TanStack Query options + hooks
│   ├── auth/
│   ├── inventory/
│   ├── products/
│   ├── transactions/
│   └── vendors/
├── store.ts            ← global store (Jotai or Zustand)
└── utils/              ← shared utilities
    ├── api/            ← callApi, ApiError
    ├── currency/       ← peso formatting helpers
    ├── react-query/    ← getQueryClient, prepareQueryResult
    └── ...
```

---

## `src/interfaces/` — domain TypeScript types

Shared domain types that are NOT UI/component types. Examples:

```ts
// interfaces/vendor.ts      → Vendor, VendorProfile, VendorCreateParams
// interfaces/product.ts     → Product, ProductCategory, ProductSearchParams
// interfaces/transaction.ts → Transaction, TransactionLine, PaymentMethod
// interfaces/inventory.ts   → StockEntry, StockAdjustment
// interfaces/auth.ts        → User, Role ('admin' | 'vendor' | 'cashier'), Session
```

```ts
import type { Transaction } from '@/interfaces'
```

---

## `src/config/clientConfig.ts` — runtime environment

```ts
import { clientConfig } from '@/config/clientConfig'

clientConfig.apiUrl    // NEXT_PUBLIC_API_URL
clientConfig.siteUrl   // NEXT_PUBLIC_SITE_URL
```

Use `clientConfig` in client-side code. `process.env.NEXT_PUBLIC_*` is acceptable in server components and `queryFn`.

---

## File naming conventions

| File | Purpose |
|------|---------|
| `ComponentName.tsx` | React component |
| `ComponentName.module.css` | Component styles (CSS Modules + design tokens) |
| `ComponentName.types.ts` | Local types and interfaces |
| `ComponentName.hooks.ts` | Component-local custom hooks |
| `ComponentName.utils.ts` | Pure utility functions |
| `ComponentName.const.ts` | Constants |
| `ComponentName.mappers.ts` | Data → view-model transformations |
| `index.ts` | Barrel export (every directory level) |

### Naming rules

- **Components**: PascalCase (`ProductCard`, `VendorList`)
- **Hooks**: `use` prefix (`useCart`, `useVendorProducts`)
- **Utils / const / mappers**: camelCase (`formatPeso`, `DEFAULT_PAGE_SIZE`)
- **Types / interfaces**: PascalCase (`ProductCardProps`, `CartItem`)
- **Files**: always match the export name exactly

---

## Barrel exports — every directory has `index.ts`

Every directory exports through its `index.ts`. Never bypass a barrel when importing from outside the feature.

```ts
// ✅ Correct
import { ProductCard } from '@/features/products'
import { useCurrentUser } from '@/shared/hooks'
import { cartAtom } from '@/shared/atoms'

// ❌ Wrong — bypass barrel
import { ProductCard } from '@/features/products/components/ProductCard/ProductCard'
```

Within the same feature, direct imports are fine.

---

## Path aliases

| Alias | Resolves to |
|-------|-------------|
| `@/app` | `src/app` |
| `@/config` | `src/config` |
| `@/features` | `src/features` |
| `@/interfaces` | `src/interfaces` |
| `@/navigation` | `src/navigation` |
| `@/screens` | `src/screens` |
| `@/shared` | `src/shared` |
| `@/widgets` | `src/widgets` |

---

## User roles

| Role | How they join | Access |
|------|--------------|--------|
| `admin` | System-level | All pages: vendor management, all products, all transactions, reports |
| `vendor` | Self-registration (default role on signup) | Own products, inventory, transactions + POS terminal. Can invite cashiers. |
| `cashier` | Invited by a vendor | POS terminal only |

Route groups map directly to roles. `RoleGuard` in `shared/components/` wraps route group layouts to enforce access.

---

## Where to put new code

| What you're building | Where it goes |
|----------------------|---------------|
| New page | `src/app/(admin\|vendor\|pos\|auth)/your-page/page.tsx` |
| New data query / hook | `src/shared/queries/<domain>/useHookName/` |
| Reusable component (cross-feature) | `src/shared/components/MyComponent/` |
| Feature-specific component | `src/features/<feature>/components/` |
| Page assembly (multiple features) | `src/screens/MyScreen/` |
| Domain type | `src/interfaces/<domain>.ts` |
| Standalone UI block or nav chrome | `src/widgets/MyWidget/` |
| Route constant | `src/navigation/navigation.routes.ts` |

---

## Checklist when adding a new feature

- [ ] Create `src/features/<feature-name>/` with `index.ts`
- [ ] Add queries in `src/shared/queries/<domain>/`
- [ ] Add domain types in `src/interfaces/`
- [ ] Create page in `src/app/(admin|vendor|pos|auth)/`
- [ ] Add route constant to `src/navigation/navigation.routes.ts`
- [ ] Wire `PrefetchQuery` in the page server component
