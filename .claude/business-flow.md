# Business Flow

## Registration & roles

- Anyone who signs up is automatically a **vendor** — no role selection on signup.
- Vendors create and manage their own store (stall) after registering.
- Vendors can invite users to join their store as **cashiers** via an invite link.
- Cashiers cannot self-register — they only join through a vendor invite.
- **Admin** is a system-level role, not obtained through normal registration.

## Role permissions — configurable

Roles define **default** access. Vendors can customize what their cashiers are allowed to do.

Default access per role:

| Permission | Admin | Vendor | Cashier (default) |
|------------|-------|--------|-------------------|
| POS terminal | ✓ | ✓ | ✓ |
| View own products | ✓ | ✓ | — |
| CRUD products | ✓ | ✓ | — |
| View inventory | ✓ | ✓ | — |
| Manage inventory | ✓ | ✓ | — |
| View transactions | ✓ | ✓ | — |
| View reports | ✓ | ✓ | — |
| Invite cashiers | ✓ | ✓ | — |
| Manage all vendors | ✓ | — | — |

A vendor can grant their cashiers additional permissions — for example, allowing a trusted cashier to do CRUD on products. These are per-store settings, not global.

## Vendor flow

1. Vendor registers → account created with `vendor` role.
2. Vendor creates their store (name, stall details).
3. Vendor adds products with prices and stock counts.
4. Vendor can invite cashiers and optionally extend their permissions.
5. Vendor accesses their own dashboard, products, inventory, transactions, and the POS terminal.

## Cashier flow

1. Vendor sends an invite link to a cashier.
2. Cashier registers via the invite link → account created with `cashier` role, linked to the vendor's store.
3. Cashier accesses the POS terminal by default. Additional access is granted by the vendor.

## POS terminal access

- Both **vendors** and **cashiers** can use the POS terminal.
- The POS shows products from the vendor's store.
- Sales are automatically recorded against the vendor's account.

## Admin flow

- Admin has a global view of all vendors, products, transactions, and reports.
- Admin does not go through the normal signup flow.
