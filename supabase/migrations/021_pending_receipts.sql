-- Pending receipts: scanned items awaiting room assignment
create table if not exists pending_receipts (
  id uuid default gen_random_uuid() primary key,
  home_id uuid references homes(id) on delete cascade not null,
  name text not null,
  brand text,
  model text,
  category text,
  purchase_price numeric,
  purchase_date date,
  store_vendor text,
  warranty_expiry date,
  warranty_provider text,
  warranty_contact text,
  receipt_image_url text,
  scanned_by uuid references auth.users(id),
  created_at timestamptz default now() not null
);

alter table pending_receipts enable row level security;

-- All home members can view pending receipts
create policy "Members can view pending receipts"
  on pending_receipts for select
  using (get_home_member_role(home_id, auth.uid()) in ('owner', 'manager', 'limited'));

-- Only owners/managers can insert
create policy "Managers can insert pending receipts"
  on pending_receipts for insert
  with check (get_home_member_role(home_id, auth.uid()) in ('owner', 'manager'));

-- Only owners/managers can update
create policy "Managers can update pending receipts"
  on pending_receipts for update
  using (get_home_member_role(home_id, auth.uid()) in ('owner', 'manager'));

-- Only owners/managers can delete
create policy "Managers can delete pending receipts"
  on pending_receipts for delete
  using (get_home_member_role(home_id, auth.uid()) in ('owner', 'manager'));
