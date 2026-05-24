-- Reverse gcash_accounts.balance when a gcash_in or gcash_out transaction is voided/refunded.
-- gcash_in void  → balance was +amount on record → reverse with -amount
-- gcash_out void → balance was -amount on record → reverse with +amount
create or replace function public.handle_transaction_status_change()
returns trigger
language plpgsql
as $$
begin
  if new.status in ('voided', 'refunded') and old.status = 'completed' then

    -- Restore inventory for fixed-price sale items
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

    -- Reverse GCash balance for gcash_in / gcash_out transactions
    if new.transaction_type in ('gcash_in', 'gcash_out') then
      update public.gcash_accounts ga
      set
        balance = case new.transaction_type
          when 'gcash_in'  then ga.balance - gtd.amount  -- undo the +amount
          when 'gcash_out' then ga.balance + gtd.amount  -- undo the -amount
        end,
        updated_at = now()
      from public.gcash_transaction_details gtd
      where gtd.transaction_id = new.id
        and ga.id = gtd.gcash_account_id;
    end if;

  end if;
  return new;
end;
$$;
