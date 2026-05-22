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
├── layout.tsx                    ← root layout (fonts, global CSS, providers)
├── providers.tsx                 ← QueryClient, state, theme
├── page.tsx                      ← landing page (SSR, public)
│
├── (auth)/                       ← unauthenticated pages only
│   ├── layout.tsx                ← split-panel auth layout
│   ├── login/page.tsx
│   └── signup/page.tsx
│
├── dashboard/                    ← authenticated landing — everyone
│   └── page.tsx                  ← shows owned stores + memberships; "create store" if none
│
├── store/
│   ├── new/
│   │   └── page.tsx              ← create a new store
│   └── [id]/                     ← store-scoped pages (owner or member with access)
│       ├── layout.tsx            ← store auth gate + AppShell with store context
│       ├── pointofsale/
│       │   └── page.tsx          ← POS terminal (fullscreen, owner + members)
│       ├── products/
│       │   ├── page.tsx          ← product list + search
│       │   └── [productId]/
│       │       └── page.tsx      ← product detail / edit
│       ├── inventory/
│       │   └── page.tsx          ← stock levels + low-stock alerts
│       ├── transactions/
│       │   ├── page.tsx          ← transaction history
│       │   └── [txId]/
│       │       └── page.tsx      ← transaction detail / receipt
│       └── reports/
│           └── page.tsx          ← sales + inventory reports
│
└── admin/                        ← admin-only (users.role = 'admin')
    ├── layout.tsx                ← admin auth gate + AppShell
    ├── dashboard/page.tsx        ← platform overview
    ├── stores/
    │   ├── page.tsx              ← all stores
    │   └── [id]/page.tsx         ← store detail
    └── users/
        └── page.tsx              ← all users
```

### Route access rules

| Route | Who can access |
|-------|---------------|
| `/dashboard` | Any authenticated user |
| `/store/new` | Any authenticated user |
| `/store/[id]/pointofsale` | Store owner + store members |
| `/store/[id]/products` | Store owner + members with `crud_products` or read |
| `/store/[id]/inventory` | Store owner + members with `view_inventory` |
| `/store/[id]/transactions` | Store owner + members with `view_transactions` |
| `/store/[id]/reports` | Store owner + members with `view_reports` |
| `/admin/*` | `users.role = 'admin'` only |

Access is enforced in `store/[id]/layout.tsx` by checking `stores.owner_id` and `store_members`.

### Page pattern (thin server component)

```tsx
// app/store/[id]/products/[productId]/page.tsx
const Page = async ({ params }: { params: Promise<{ id: string; productId: string }> }) => {
  const { id, productId } = await params
  return (
    <HydrationBoundary state={dehydrate(getQueryClient())}>
      <ProductDetailScreen storeId={id} productId={productId} />
    </HydrationBoundary>
  )
}
```

---

## `src/features/` — product features

Each feature is self-contained. Features do not import from other features.

```
features/
├── auth/               ← LoginForm, session management
├── dashboard/          ← Store cards, "create store" CTA
├── inventory/          ← Stock levels, low-stock alerts, restock
├── notifications/      ← Toast notifications
├── pos/                ← POS terminal: product grid, cart, checkout, payment
├── products/           ← Product catalog: add, edit, search, categories
├── reports/            ← Sales and inventory reports, charts
├── store/              ← Store creation, settings, member management
└── transactions/       ← Transaction list, receipt detail, refunds
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
├── AppShell/           ← layout wrapper: sidebar + header (store-context-aware)
├── AccountMenu/        ← avatar button + sign-out popup
├── Header/             ← top bar (AccountMenu, store name)
├── Sidebar/            ← side nav — links built from current store ID via useParams()
├── Footer/             ← bottom bar (POS / auth layouts)
├── RevenueChart/       ← revenue over time chart
├── StockAlertBadge/    ← low-stock indicator
└── SummaryCard/        ← stat card (total sales, orders, etc.)
```

> **AppShell sidebar links** are store-scoped. The sidebar reads `storeId` from `useParams()` and builds links as `/store/${storeId}/products`, `/store/${storeId}/inventory`, etc. Never hardcode store IDs.

---

## `src/shared/` — cross-feature reusables

```
shared/
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
    ├── currency/       ← peso formatting helpers
    ├── react-query/    ← getQueryClient, prepareQueryResult
    └── supabase/       ← Supabase client factories
        ├── server.ts   ← createClient(cookieStore) — Server Components & Route Handlers
        ├── client.ts   ← createClient() — Client Components & hooks
        ├── middleware.ts ← createClient(request) — Next.js middleware
        └── index.ts    ← barrel exports
```

### Supabase client usage

| Context | Import |
|---------|--------|
| Client Component / hook | `import { createBrowserSupabaseClient } from '@/shared/utils/supabase'` |
| Server Component / Route Handler | `import { createClient } from '@/shared/utils/supabase/server'` |
| `src/middleware.ts` | `import { createClient } from '@/shared/utils/supabase/middleware'` |

The server and middleware clients import `next/headers` / `next/server`. They must be imported **directly from their file** — never through the barrel — or they will be bundled into client components and cause a build error.

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

## User roles & access model

`users.role` is system-level only: `admin | user`.  
Store-level access comes from `stores.owner_id` and `store_members`.

| Who | How | Access |
|-----|-----|--------|
| `admin` | System-level | `/admin/*` + all store pages |
| Store owner | Created a store (`stores.owner_id`) | `/dashboard` + all `/store/[id]/*` for their store |
| Store member (cashier/manager) | Added via invite to `store_members` | `/store/[id]/pointofsale` + pages their permissions allow |
| New user | Just registered, no store yet | `/dashboard` (sees "Create store" prompt) |

Access is enforced per-route in `src/app/store/[id]/layout.tsx` and `src/app/admin/layout.tsx`.

---

## Where to put new code

| What you're building | Where it goes |
|----------------------|---------------|
| Store-scoped page | `src/app/store/[id]/<section>/page.tsx` |
| Auth page | `src/app/(auth)/<page>/page.tsx` |
| Admin page | `src/app/admin/<section>/page.tsx` |
| New data query / hook | `src/shared/queries/<domain>/useHookName.ts` |
| Reusable component (cross-feature) | `src/shared/components/MyComponent/` |
| Feature-specific component | `src/features/<feature>/components/` |
| Page assembly (multiple features) | `src/screens/MyScreen/` |
| Domain type | `src/interfaces/<domain>.ts` |
| Standalone UI block or nav chrome | `src/widgets/MyWidget/` |
| Route constant | `src/navigation/navigation.routes.ts` |

---

## Checklist when adding a new store-scoped feature

- [ ] Create `src/features/<feature-name>/` with `index.ts`
- [ ] Add queries in `src/shared/queries/<domain>/`
- [ ] Add domain types in `src/interfaces/`
- [ ] Create page at `src/app/store/[id]/<section>/page.tsx`
- [ ] Add route constant to `src/navigation/navigation.routes.ts`
- [ ] Wire `HydrationBoundary` + `prefetchQuery` in the page server component
- [ ] Add nav item to `AppShell` sidebar if it needs a top-level link
