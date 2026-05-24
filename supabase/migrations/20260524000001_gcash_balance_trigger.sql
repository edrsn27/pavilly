-- Update gcash_accounts.balance when a gcash service transaction is recorded.
-- gcash_in  → money comes INTO the store's GCash → balance +amount
-- gcash_out → money goes OUT of the store's GCash → balance -amount
create or replace function public.handle_gcash_detail_insert()
returns trigger
language plpgsql
as $$
declare
  v_type text;
begin
  select transaction_type into v_type
  from public.transactions
  where id = new.transaction_id;

  if v_type = 'gcash_in' then
    update public.gcash_accounts
    set balance = balance + new.amount, updated_at = now()
    where id = new.gcash_account_id;
  elsif v_type = 'gcash_out' then
    update public.gcash_accounts
    set balance = balance - new.amount, updated_at = now()
    where id = new.gcash_account_id;
  end if;

  return new;
end;
$$;

create trigger on_gcash_detail_insert
  after insert on public.gcash_transaction_details
  for each row execute function public.handle_gcash_detail_insert();
