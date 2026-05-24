# Business Flow

## Registration & roles

- Anyone who signs up gets a `users.role` of `'user'`. This is a system-level role — it only distinguishes regular users from `'admin'`.
- **Vendor** is not a role. A user becomes a "vendor" by creating a store — they are the `owner_id` of that store.
- **Cashier** is not a role. A user becomes a cashier by being added to `store_members` with `member_role = 'cashier'`.
- **Admin** is the only elevated system-level role. Not obtained through normal registration.

## What determines access

| Question | How to answer |
|----------|--------------|
| Is this user an admin? | `users.role = 'admin'` |
| Does this user own a store? | `stores WHERE owner_id = auth.uid()` |
| Is this user a member of a store? | `store_members WHERE user_id = auth.uid()` |
| What can this member do? | `store_members.permissions` (jsonb) |
| What is their display role? | `store_members.member_role` (`cashier` or `manager`) |

## Store member roles (`store_members.member_role`)

| Role | Description |
|------|-------------|
| `cashier` | Default. POS access only unless permissions are extended. |
| `manager` | Elevated member. Vendor can grant broader default permissions. |

Permissions are still controlled by the `permissions` jsonb — `member_role` is a display label and can be used to set default permission presets when inviting.

## Configurable permissions (per store member)

All default `false`. Vendor/admin can toggle per member.

| Permission | What it unlocks |
|------------|----------------|
| `crud_products` | Create, edit, delete products |
| `view_inventory` | See stock levels |
| `manage_inventory` | Adjust stock |
| `view_transactions` | See transaction history |
| `view_reports` | Access reports |

## User flow after sign-in

After signing in, the app checks store context to redirect:

| Condition | Redirect |
|-----------|----------|
| `users.role = 'admin'` | `/dashboard` |
| Owns a store (`stores.owner_id`) | `/dashboard` |
| Store member only (no owned store) | `/pos` |
| New user (no store, no membership) | `/dashboard` (to create store) |

## Vendor (store owner) flow

1. User registers → `users.role = 'user'`.
2. User creates a store → they become `stores.owner_id`. They are now a "vendor".
3. User adds products, sets stock, manages their stall.
4. User invites cashiers → invite link creates `store_members` row for the accepted user.
5. User accesses dashboard, products, inventory, transactions, and the POS terminal.

## Cashier flow

1. Store owner sends an invite link.
2. User registers via invite link → `users.role = 'user'`, plus a `store_members` row linking them to the store.
3. Cashier accesses the POS terminal by default. Owner can extend permissions.

## Dashboard visibility

- **Store owner:** sees their own store's stats, products, inventory, transactions.
- **New user (no store):** sees a "Create your store" prompt.
- **Admin:** sees all stores across the platform.
- **Cashier (member only):** redirected to POS — no dashboard access.

## GCash service flow

GCash In and GCash Out are recorded as transactions (`transaction_type = 'gcash_in'` or `'gcash_out'`), not as product sales. They have no `transaction_items` rows. Extra detail lives in `gcash_transaction_details`.

| Type | What happens | Balance effect |
|------|-------------|---------------|
| `gcash_in` | Customer gives you cash → you load GCash to their number | `gcash_accounts.balance` increases by `amount` |
| `gcash_out` | Customer sends GCash to you → you give them cash | `gcash_accounts.balance` decreases by `amount` |

- **`profit`** is the service fee the cashier enters manually — it is separate from `amount`.
- The balance update is handled by the `handle_gcash_detail_insert` DB trigger on `gcash_transaction_details` insert.
- A store can have multiple GCash accounts (`gcash_accounts`). The cashier selects which account was used per transaction.
- GCash transactions are initiated from the POS Cart footer via `GcashServiceModal` — not through the normal checkout flow.

## Admin flow

- Global view: all users, all stores, all transactions, all reports.
- Can impersonate or manage any store.
- Does not go through the normal signup flow.
