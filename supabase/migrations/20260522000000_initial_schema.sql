-- ============================================================
-- Pavilly — Initial Schema
-- ============================================================

-- ── Reset (DEV ONLY — remove before production) ───────────────────────────
drop schema public cascade;
create schema public;
grant usage on schema public to anon, authenticated, service_role;
grant all on schema public to postgres;

-- ── Extensions ───────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";


-- ============================================================
-- TABLES
-- ============================================================

-- ── users ────────────────────────────────────────────────────────────────
create table public.users (
  id          uuid        primary key references auth.users(id) on delete cascade,
  email       text        not null unique,
  full_name   text        not null default '',
  role        text        not null default 'user'
                          check (role in ('admin', 'user')),
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── stores ───────────────────────────────────────────────────────────────
create table public.stores (
  id          uuid        primary key default gen_random_uuid(),
  owner_id    uuid        not null references public.users(id) on delete cascade,
  name        text        not null,
  description text,
  logo_url    text,
  is_active   boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── store_members ─────────────────────────────────────────────────────────
create table public.store_members (
  id          uuid        primary key default gen_random_uuid(),
  store_id    uuid        not null references public.stores(id) on delete cascade,
  user_id     uuid        not null references public.users(id) on delete cascade,
  member_role text        not null default 'cashier'
                          check (member_role in ('cashier', 'manager')),
  permissions jsonb       not null default '{
    "crud_products":     false,
    "view_inventory":    false,
    "manage_inventory":  false,
    "view_transactions": false,
    "view_reports":      false
  }'::jsonb,
  created_at  timestamptz not null default now(),
  unique (store_id, user_id)
);

-- ── categories ───────────────────────────────────────────────────────────
create table public.categories (
  id         uuid        primary key default gen_random_uuid(),
  store_id   uuid        not null references public.stores(id) on delete cascade,
  name       text        not null,
  sort_order int         not null default 0,
  created_at timestamptz not null default now()
);

-- ── products ─────────────────────────────────────────────────────────────
create table public.products (
  id            uuid           primary key default gen_random_uuid(),
  store_id      uuid           not null references public.stores(id) on delete cascade,
  category_id   uuid           references public.categories(id) on delete set null,
  name          text           not null,
  description   text,
  price_type    text           not null default 'fixed'
                               check (price_type in ('fixed', 'variable')),
  cost_price    numeric(10,2)  check (cost_price >= 0),
  selling_price numeric(10,2)  check (selling_price >= 0),
  image_url     text,
  is_active     boolean        not null default true,
  created_at    timestamptz    not null default now(),
  updated_at    timestamptz    not null default now()
);

-- ── inventory ─────────────────────────────────────────────────────────────
create table public.inventory (
  id                  uuid        primary key default gen_random_uuid(),
  product_id          uuid        not null unique references public.products(id) on delete cascade,
  stock               int         not null default 0 check (stock >= 0),
  low_stock_threshold int         not null default 5,
  updated_at          timestamptz not null default now()
);

-- ── transactions ──────────────────────────────────────────────────────────
create table public.transactions (
  id               uuid           primary key default gen_random_uuid(),
  store_id         uuid           not null references public.stores(id) on delete cascade,
  cashier_id       uuid           not null references public.users(id),
  transaction_type text           not null default 'sale'
                                  check (transaction_type in ('sale', 'gcash_in', 'gcash_out')),
  total            numeric(10,2)  not null,
  payment_method   text           not null
                                  check (payment_method in ('cash', 'gcash', 'maya', 'card')),
  amount_tendered  numeric(10,2),
  change           numeric(10,2),
  status           text           not null default 'completed'
                                  check (status in ('completed', 'voided', 'refunded')),
  void_reason      text,
  notes            text,
  created_at       timestamptz    not null default now()
);

-- ── transaction_items ────────────────────────────────────────────────────
create table public.transaction_items (
  id              uuid          primary key default gen_random_uuid(),
  transaction_id  uuid          not null references public.transactions(id) on delete cascade,
  product_id      uuid          not null references public.products(id),
  product_name    text          not null,
  cost_price      numeric(10,2),
  selling_price   numeric(10,2) not null,
  quantity        int           not null check (quantity > 0),
  subtotal        numeric(10,2) not null
);

-- ── gcash_accounts ────────────────────────────────────────────────────────
create table public.gcash_accounts (
  id          uuid           primary key default gen_random_uuid(),
  store_id    uuid           not null references public.stores(id) on delete cascade,
  name        text           not null,
  number      text           not null,
  balance     numeric(10,2)  not null default 0,
  is_active   boolean        not null default true,
  created_at  timestamptz    not null default now(),
  updated_at  timestamptz    not null default now()
);

-- ── gcash_transaction_details ─────────────────────────────────────────────
-- Exists only for gcash_in / gcash_out transactions.
create table public.gcash_transaction_details (
  id                uuid           primary key default gen_random_uuid(),
  transaction_id    uuid           not null unique references public.transactions(id) on delete cascade,
  gcash_account_id  uuid           not null references public.gcash_accounts(id),
  customer_number   text           not null,
  reference_number  text,
  amount            numeric(10,2)  not null,
  profit            numeric(10,2)  not null default 0
);

-- ── inventory_logs ────────────────────────────────────────────────────────
create table public.inventory_logs (
  id            uuid        primary key default gen_random_uuid(),
  product_id    uuid        not null references public.products(id) on delete cascade,
  change        int         not null,
  reason        text        not null
                            check (reason in ('sale', 'restock', 'adjustment', 'void', 'refund')),
  reference_id  uuid,
  notes         text,
  created_by    uuid        references public.users(id),
  created_at    timestamptz not null default now()
);

-- ── invites ───────────────────────────────────────────────────────────────
create table public.invites (
  id          uuid        primary key default gen_random_uuid(),
  store_id    uuid        not null references public.stores(id) on delete cascade,
  invited_by  uuid        not null references public.users(id),
  token       text        not null unique default encode(gen_random_bytes(32), 'hex'),
  email       text,
  used_by     uuid        references public.users(id),
  used_at     timestamptz,
  expires_at  timestamptz not null default (now() + interval '7 days'),
  created_at  timestamptz not null default now()
);


-- ============================================================
-- TABLE PRIVILEGES
-- ============================================================
-- RLS handles row-level filtering; these grants give the roles
-- base access so queries aren't rejected before RLS even runs.

grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on public.invites to anon;


-- ============================================================
-- RLS HELPER FUNCTIONS (security definer — bypass RLS for cross-table checks)
-- ============================================================
-- Without these, stores policy queries store_members, which queries stores → infinite loop.

create or replace function public.is_store_owner(p_store_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.stores
    where id = p_store_id and owner_id = auth.uid()
  );
$$;

create or replace function public.is_store_member(p_store_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.store_members
    where store_id = p_store_id and user_id = auth.uid()
  );
$$;


-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- ── set_updated_at ───────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.users
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.stores
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.products
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.inventory
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.gcash_accounts
  for each row execute function public.set_updated_at();


-- ── on_auth_user_created ─────────────────────────────────────────────────
-- Creates a public.users row whenever someone registers via Supabase Auth.
-- Role defaults to 'vendor' — cashiers get their role updated when they
-- consume an invite link.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ── on_product_created ───────────────────────────────────────────────────
-- Auto-creates an inventory row with stock = 0 for every new product.
create or replace function public.handle_new_product()
returns trigger
language plpgsql
as $$
begin
  insert into public.inventory (product_id)
  values (new.id);
  return new;
end;
$$;

create trigger on_product_created
  after insert on public.products
  for each row execute function public.handle_new_product();


-- ── on_transaction_item_insert ───────────────────────────────────────────
-- Decrements inventory stock when a fixed-price item is sold.
-- Variable products are skipped (no stock to track).
create or replace function public.handle_transaction_item_insert()
returns trigger
language plpgsql
as $$
begin
  update public.inventory
  set stock = stock - new.quantity
  where product_id = new.product_id
    and (select price_type from public.products where id = new.product_id) = 'fixed';
  return new;
end;
$$;

create trigger on_transaction_item_insert
  after insert on public.transaction_items
  for each row execute function public.handle_transaction_item_insert();


-- ── on_transaction_voided_or_refunded ────────────────────────────────────
-- Restores inventory stock when a transaction is voided or refunded.
-- Logs each restored item in inventory_logs.
create or replace function public.handle_transaction_status_change()
returns trigger
language plpgsql
as $$
begin
  if new.status in ('voided', 'refunded') and old.status = 'completed' then
    update public.inventory i
    set stock = i.stock + ti.quantity
    from public.transaction_items ti
    join public.products p on p.id = ti.product_id
    where ti.transaction_id = new.id
      and i.product_id = ti.product_id
      and p.price_type = 'fixed';

    insert into public.inventory_logs (product_id, change, reason, reference_id, created_by)
    select
      ti.product_id,
      ti.quantity,
      case new.status when 'voided' then 'void' else 'refund' end,
      new.id,
      new.cashier_id
    from public.transaction_items ti
    join public.products p on p.id = ti.product_id
    where ti.transaction_id = new.id
      and p.price_type = 'fixed';
  end if;
  return new;
end;
$$;

create trigger on_transaction_status_change
  after update of status on public.transactions
  for each row execute function public.handle_transaction_status_change();


-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- ── users ────────────────────────────────────────────────────────────────
create policy "users: read own row"
  on public.users for select
  using (auth.uid() = id);

create policy "users: update own row"
  on public.users for update
  using (auth.uid() = id);


-- ── stores ───────────────────────────────────────────────────────────────
create policy "stores: owner full access"
  on public.stores for all
  using (auth.uid() = owner_id);

create policy "stores: members can read"
  on public.stores for select
  using (public.is_store_member(id));


-- ── store_members ─────────────────────────────────────────────────────────
create policy "store_members: owner manages"
  on public.store_members for all
  using (public.is_store_owner(store_id));

create policy "store_members: cashier reads own row"
  on public.store_members for select
  using (auth.uid() = user_id);


-- ── categories ───────────────────────────────────────────────────────────
create policy "categories: owner full access"
  on public.categories for all
  using (public.is_store_owner(store_id));

create policy "categories: members can read"
  on public.categories for select
  using (public.is_store_member(store_id));


-- ── products ─────────────────────────────────────────────────────────────
create policy "products: owner full access"
  on public.products for all
  using (public.is_store_owner(store_id));

create policy "products: members can read"
  on public.products for select
  using (public.is_store_member(store_id));

create policy "products: cashier insert if permitted"
  on public.products for insert
  with check (
    exists (
      select 1 from public.store_members
      where store_id = products.store_id
        and user_id = auth.uid()
        and (permissions->>'crud_products')::boolean = true
    )
  );

create policy "products: cashier update if permitted"
  on public.products for update
  using (
    exists (
      select 1 from public.store_members
      where store_id = products.store_id
        and user_id = auth.uid()
        and (permissions->>'crud_products')::boolean = true
    )
  );

create policy "products: cashier delete if permitted"
  on public.products for delete
  using (
    exists (
      select 1 from public.store_members
      where store_id = products.store_id
        and user_id = auth.uid()
        and (permissions->>'crud_products')::boolean = true
    )
  );


-- ── inventory ─────────────────────────────────────────────────────────────
create policy "inventory: owner full access"
  on public.inventory for all
  using (
    exists (
      select 1 from public.products p
      join public.stores s on s.id = p.store_id
      where p.id = inventory.product_id and s.owner_id = auth.uid()
    )
  );

create policy "inventory: members can read"
  on public.inventory for select
  using (
    exists (
      select 1 from public.products p
      join public.store_members sm on sm.store_id = p.store_id
      where p.id = inventory.product_id and sm.user_id = auth.uid()
    )
  );

create policy "inventory: cashier manage if permitted"
  on public.inventory for update
  using (
    exists (
      select 1 from public.products p
      join public.store_members sm on sm.store_id = p.store_id
      where p.id = inventory.product_id
        and sm.user_id = auth.uid()
        and (sm.permissions->>'manage_inventory')::boolean = true
    )
  );


-- ── transactions ──────────────────────────────────────────────────────────
create policy "transactions: owner full access"
  on public.transactions for all
  using (public.is_store_owner(store_id));

create policy "transactions: cashier insert"
  on public.transactions for insert
  with check (
    auth.uid() = cashier_id
    and public.is_store_member(store_id)
  );

create policy "transactions: cashier read own"
  on public.transactions for select
  using (auth.uid() = cashier_id);


-- ── transaction_items ────────────────────────────────────────────────────
create policy "transaction_items: owner full access"
  on public.transaction_items for all
  using (
    exists (
      select 1 from public.transactions t
      join public.stores s on s.id = t.store_id
      where t.id = transaction_items.transaction_id and s.owner_id = auth.uid()
    )
  );

create policy "transaction_items: cashier insert"
  on public.transaction_items for insert
  with check (
    exists (
      select 1 from public.transactions t
      where t.id = transaction_items.transaction_id and t.cashier_id = auth.uid()
    )
  );

create policy "transaction_items: cashier read own"
  on public.transaction_items for select
  using (
    exists (
      select 1 from public.transactions t
      where t.id = transaction_items.transaction_id and t.cashier_id = auth.uid()
    )
  );


-- ── invites ───────────────────────────────────────────────────────────────
create policy "invites: owner full access"
  on public.invites for all
  using (
    exists (
      select 1 from public.stores
      where id = invites.store_id and owner_id = auth.uid()
    )
  );

create policy "invites: anyone can read by token"
  on public.invites for select
  using (true);


-- ── gcash_accounts ────────────────────────────────────────────────────────
create policy "gcash_accounts: owner full access"
  on public.gcash_accounts for all
  using (public.is_store_owner(store_id));

create policy "gcash_accounts: members can read"
  on public.gcash_accounts for select
  using (public.is_store_member(store_id));


-- ── gcash_transaction_details ─────────────────────────────────────────────
create policy "gcash_transaction_details: owner full access"
  on public.gcash_transaction_details for all
  using (
    exists (
      select 1 from public.transactions t
      join public.stores s on s.id = t.store_id
      where t.id = gcash_transaction_details.transaction_id and s.owner_id = auth.uid()
    )
  );

create policy "gcash_transaction_details: cashier insert"
  on public.gcash_transaction_details for insert
  with check (
    exists (
      select 1 from public.transactions t
      where t.id = gcash_transaction_details.transaction_id and t.cashier_id = auth.uid()
    )
  );

create policy "gcash_transaction_details: cashier read own"
  on public.gcash_transaction_details for select
  using (
    exists (
      select 1 from public.transactions t
      where t.id = gcash_transaction_details.transaction_id and t.cashier_id = auth.uid()
    )
  );


-- ── inventory_logs ────────────────────────────────────────────────────────
create policy "inventory_logs: owner full access"
  on public.inventory_logs for all
  using (
    exists (
      select 1 from public.products p
      join public.stores s on s.id = p.store_id
      where p.id = inventory_logs.product_id and s.owner_id = auth.uid()
    )
  );

create policy "inventory_logs: cashier insert"
  on public.inventory_logs for insert
  with check (auth.uid() = created_by);

create policy "inventory_logs: cashier read if permitted"
  on public.inventory_logs for select
  using (
    exists (
      select 1 from public.products p
      join public.store_members sm on sm.store_id = p.store_id
      where p.id = inventory_logs.product_id
        and sm.user_id = auth.uid()
        and (sm.permissions->>'view_inventory')::boolean = true
    )
  );
