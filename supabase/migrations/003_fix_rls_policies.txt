-- Drop every possible home_members policy name (original + any partial runs)
drop policy if exists "Members can read home_members for their homes" on home_members;
drop policy if exists "Owners can manage home_members" on home_members;
drop policy if exists "home_members: members can read" on home_members;
drop policy if exists "home_members: insert" on home_members;
drop policy if exists "home_members: owners can update" on home_members;
drop policy if exists "home_members: owners can delete" on home_members;

-- Security definer helpers (bypass RLS, no recursion)
create or replace function get_home_member_role(home_id_param uuid, user_id_param uuid)
returns text as $$
  select role from home_members
  where home_id = home_id_param and user_id = user_id_param
  limit 1
$$ language sql security definer stable;

create or replace function is_home_creator(home_id_param uuid, user_id_param uuid)
returns boolean as $$
  select exists (
    select 1 from homes where id = home_id_param and owner_id = user_id_param
  )
$$ language sql security definer stable;

-- SELECT: your own row, or any row in a home you belong to
create policy "home_members: members can read"
  on home_members for select using (
    user_id = auth.uid()
    or get_home_member_role(home_id, auth.uid()) is not null
  );

-- INSERT: bootstrap owner row on home creation, or owner inviting others
create policy "home_members: insert"
  on home_members for insert with check (
    (user_id = auth.uid() and is_home_creator(home_id, auth.uid()))
    or get_home_member_role(home_id, auth.uid()) = 'owner'
  );

-- UPDATE / DELETE: owners only
create policy "home_members: owners can update"
  on home_members for update using (
    get_home_member_role(home_id, auth.uid()) = 'owner'
  );

create policy "home_members: owners can delete"
  on home_members for delete using (
    get_home_member_role(home_id, auth.uid()) = 'owner'
  );
