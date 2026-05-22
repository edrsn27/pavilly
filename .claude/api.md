# API Layer

## Data fetching — TanStack Query (React Query)

All server state is managed with **TanStack Query v5**. Do not use `useEffect` + `useState` for data fetching.

### Query options pattern

Define query options as standalone factory functions in `src/shared/queries/<domain>/`. This lets both client hooks and server-side `prefetchQuery` share the same key and fetcher.

```ts
// src/shared/queries/products/productQueryOptions.ts
import { queryOptions } from '@tanstack/react-query'
import { createBrowserSupabaseClient } from '@/shared/utils/supabase'

export const productQueryOptions = (productId: string) =>
  queryOptions({
    queryKey: ['products', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()
      if (error) throw error
      return data
    },
  })
```

### Hooks

Wrap `useQuery` / `useMutation` in a named hook co-located with the query options file.

```ts
// src/shared/queries/products/useProduct.ts
import { useQuery } from '@tanstack/react-query'
import { productQueryOptions } from './productQueryOptions'

export const useProduct = (productId: string) =>
  useQuery(productQueryOptions(productId))
```

Export both from the directory's `index.ts`.

### Server prefetch

Pages are server components — prefetch data before rendering the Screen.

```tsx
// app/(vendor)/products/[id]/page.tsx
import { getQueryClient } from '@/shared/utils/react-query'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { productQueryOptions } from '@/shared/queries/products'

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const queryClient = getQueryClient()
  await queryClient.prefetchQuery(productQueryOptions(id))
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductDetailScreen />
    </HydrationBoundary>
  )
}
```

### Mutations

```ts
// src/shared/queries/products/useUpdateProduct.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createBrowserSupabaseClient } from '@/shared/utils/supabase'

export const useUpdateProduct = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...patch }: UpdateProductParams) => {
      const { data, error } = await supabase
        .from('products')
        .update(patch)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.setQueryData(['products', data.id], data)
    },
  })
}
```

### Query key conventions

| Resource | Key shape |
|----------|-----------|
| List | `['products']`, `['products', { storeId }]` |
| Single | `['products', id]` |
| Nested | `['stores', storeId, 'members']` |
| Current user | `['auth', 'user']` |

Always use the most specific key for single-item queries and a broader parent key for lists so `invalidateQueries` cascades correctly.

### Supabase client

Use the factories from `@/shared/utils/supabase` — never call `createServerClient` / `createBrowserClient` directly.

```ts
// inside a queryFn or client component hook
import { createBrowserSupabaseClient } from '@/shared/utils/supabase'
const supabase = createBrowserSupabaseClient()

// inside a server component or route handler — import the file directly, NOT the barrel
import { createClient } from '@/shared/utils/supabase/server'
const supabase = createClient(await cookies())
```

> The server and middleware clients use `next/headers` / `next/server`. Importing them through the barrel pulls those APIs into client bundles and causes a build error. Always import them directly from their file.

### Error handling

Supabase errors are thrown directly inside `queryFn` — TanStack Query surfaces them via `error` on the hook. Display errors with the shared `ErrorMessage` component; do not `try/catch` inside components.

### Stale time defaults

Set sensible `staleTime` per resource type in the query options:

| Data type | `staleTime` |
|-----------|-------------|
| Products / categories | `1000 * 60 * 5` (5 min) |
| Inventory | `1000 * 30` (30 s) |
| Transactions | `1000 * 60` (1 min) |
| Auth / current user | `Infinity` |
| Dashboard KPIs | `1000 * 60` (1 min) |
