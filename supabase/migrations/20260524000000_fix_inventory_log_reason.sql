-- Fix trigger: was inserting new.status ('voided'/'refunded') directly,
-- but the reason check constraint only allows 'void' and 'refund'.
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
