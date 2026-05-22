# Database — Supabase / PostgreSQL

All tables live in the `public` schema. RLS is enabled by default on all new tables in this project — no need to add `ENABLE ROW LEVEL SECURITY` statements.

---

## Tables

### `users`
Mirrors `auth.users`. Created automatically via trigger on signup. Default role is `vendor`.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK, references `auth.users(id)` |
| `email` | `text` | unique |
| `full_name` | `text` | |
| `role` | `text` | `'admin' \| 'vendor' \| 'cashier'` — default `'vendor'` |
| `avatar_url` | `text` | nullable |
| `created_at` | `timestamptz` | default `now()` |
| `updated_at` | `timestamptz` | default `now()` |

---

### `stores`
A vendor's stall. Each vendor owns one store.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `owner_id` | `uuid` | references `users(id)` |
| `name` | `text` | |
| `description` | `text` | nullable |
| `logo_url` | `text` | nullable |
| `is_active` | `boolean` | default `true` |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

---

### `store_members`
Links cashiers to a store. Holds per-cashier configurable permissions as jsonb.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `store_id` | `uuid` | references `stores(id)` |
| `user_id` | `uuid` | references `users(id)` |
| `permissions` | `jsonb` | default `{}` |
| `created_at` | `timestamptz` | |

Unique constraint on `(store_id, user_id)`.

**Permissions shape (all default `false`):**
```json
{
  "crud_products": false,
  "view_inventory": false,
  "manage_inventory": false,
  "view_transactions": false,
  "view_reports": false
}
```

---

### `categories`
Product categories, scoped per store. Flat — no subcategories.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `store_id` | `uuid` | references `stores(id)` |
| `name` | `text` | |
| `sort_order` | `int` | default `0` — controls display order in POS |
| `created_at` | `timestamptz` | |

---

### `products`
Products listed by a vendor. Supports fixed and variable pricing.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `store_id` | `uuid` | references `stores(id)` |
| `category_id` | `uuid` | references `categories(id)`, nullable |
| `name` | `text` | |
| `description` | `text` | nullable |
| `price_type` | `text` | `'fixed' \| 'variable'` — default `'fixed'` |
| `cost_price` | `numeric(10,2)` | nullable — what the vendor paid |
| `selling_price` | `numeric(10,2)` | nullable — null for variable products |
| `image_url` | `text` | nullable |
| `is_active` | `boolean` | default `true` |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

> Variable products (`price_type = 'variable'`) have no preset `selling_price`. The cashier enters the amount manually at the POS per transaction.

---

### `inventory`
One row per product. Auto-created on product insert via trigger.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `product_id` | `uuid` | references `products(id)`, unique |
| `stock` | `int` | ≥ 0, default `0` |
| `low_stock_threshold` | `int` | default `5` |
| `updated_at` | `timestamptz` | |

> Stock is not decremented for variable products (`price_type = 'variable'`).

---

### `transactions`
Sales header. One row per checkout.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `store_id` | `uuid` | references `stores(id)` |
| `cashier_id` | `uuid` | references `users(id)` |
| `transaction_type` | `text` | `'sale' \| 'gcash_in' \| 'gcash_out'` — default `'sale'` |
| `total` | `numeric(10,2)` | |
| `payment_method` | `text` | `'cash' \| 'gcash' \| 'maya' \| 'card'` |
| `amount_tendered` | `numeric(10,2)` | nullable |
| `change` | `numeric(10,2)` | nullable |
| `status` | `text` | `'completed' \| 'voided' \| 'refunded'` — default `'completed'` |
| `void_reason` | `text` | nullable — required when voiding |
| `notes` | `text` | nullable — free-form cashier notes |
| `created_at` | `timestamptz` | |

---

### `transaction_items`
Line items per transaction. Snapshots name and prices at time of sale.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `transaction_id` | `uuid` | references `transactions(id)` |
| `product_id` | `uuid` | references `products(id)` |
| `product_name` | `text` | snapshot — preserves history if product is renamed |
| `cost_price` | `numeric(10,2)` | snapshot, nullable |
| `selling_price` | `numeric(10,2)` | snapshot — cashier-entered amount for variable products |
| `quantity` | `int` | > 0 |
| `subtotal` | `numeric(10,2)` | `selling_price × quantity` |

---

### `gcash_accounts`
GCash numbers owned by the store that customers send money to. A store can have multiple accounts.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `store_id` | `uuid` | references `stores(id)` |
| `name` | `text` | friendly label (e.g. "Main GCash", "Backup") |
| `number` | `text` | GCash mobile number |
| `balance` | `numeric(10,2)` | running balance — updated per gcash_in/gcash_out |
| `is_active` | `boolean` | default `true` |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

---

### `gcash_transaction_details`
Extra detail row for GCash service transactions. One row per `gcash_in` or `gcash_out` transaction.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `transaction_id` | `uuid` | references `transactions(id)`, unique — one detail per transaction |
| `gcash_account_id` | `uuid` | references `gcash_accounts(id)` — account the customer sent to / received from |
| `customer_number` | `text` | customer's GCash number |
| `reference_number` | `text` | nullable — GCash reference number from the receipt |
| `amount` | `numeric(10,2)` | amount the customer sent/received |
| `profit` | `numeric(10,2)` | service fee earned — cashier enters manually |

> Only present for `transaction_type = 'gcash_in'` or `'gcash_out'`. Normal `sale` transactions have no row here.

---

### `inventory_logs`
Audit trail for every stock change — sales, restocks, manual adjustments, voids, refunds.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `product_id` | `uuid` | references `products(id)` |
| `change` | `int` | positive = stock added, negative = stock removed |
| `reason` | `text` | `'sale' \| 'restock' \| 'adjustment' \| 'void' \| 'refund'` |
| `reference_id` | `uuid` | nullable — `transaction_id` for sale/void/refund |
| `notes` | `text` | nullable — free-form |
| `created_by` | `uuid` | references `users(id)` |
| `created_at` | `timestamptz` | |

---

### `invites`
Pending cashier invite links generated by vendors.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `store_id` | `uuid` | references `stores(id)` |
| `invited_by` | `uuid` | references `users(id)` |
| `token` | `text` | unique, random hex — used in the invite URL |
| `email` | `text` | nullable — vendor can pre-fill |
| `used_by` | `uuid` | references `users(id)`, nullable |
| `used_at` | `timestamptz` | nullable |
| `expires_at` | `timestamptz` | default `now() + 7 days` |
| `created_at` | `timestamptz` | |

---

## Triggers

| Trigger | On | Action |
|---------|----|--------|
| `on_auth_user_created` | `INSERT` on `auth.users` | Creates row in `public.users` with default role `'vendor'` |
| `on_product_created` | `INSERT` on `products` | Creates `inventory` row with `stock = 0` |
| `on_transaction_item_insert` | `INSERT` on `transaction_items` | Decrements `inventory.stock` by `quantity` (fixed products only) |
| `on_transaction_status_change` | `UPDATE of status` on `transactions` | Restores `inventory.stock` and inserts `inventory_logs` rows when status changes to `'voided'` or `'refunded'` (fixed products only) |
| `set_updated_at` | `UPDATE` on tables with `updated_at` | Sets `updated_at = now()` |

---

## RLS policies (summary)

| Table | Rule |
|-------|------|
| `users` | Read/update own row only |
| `stores` | Owner full access; store members read only |
| `store_members` | Owner manages members; cashier reads own row |
| `categories` | Owner full access; store members read |
| `products` | Owner full access; cashiers read (write if `crud_products = true`) |
| `inventory` | Owner full access; cashiers read (write if `manage_inventory = true`) |
| `transactions` | Owner full access; cashiers insert + read own transactions |
| `transaction_items` | Same as transactions |
| `gcash_accounts` | Owner full access; store members read |
| `gcash_transaction_details` | Owner full access; cashier insert + read own |
| `inventory_logs` | Owner full access; cashier insert; cashier read if `view_inventory = true` |
| `invites` | Owner of store full access |

---

## Migration files

| File | Description |
|------|-------------|
| `supabase/migrations/20260522000000_initial_schema.sql` | Full initial schema — all tables, triggers, RLS policies including GCash accounts, transaction details, and inventory logs |
