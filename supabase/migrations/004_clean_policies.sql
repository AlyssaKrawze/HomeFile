-- ============================================================
-- Drop every known policy on profiles and home_members
-- (covers all names from migrations 001, 002, 003)
-- ============================================================

-- profiles
drop policy if exists "Users can read own profile"   on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Users can insert own profile" on profiles;

-- home_members (original names from 001)
drop policy if exists "Members can read home_members for their homes" on home_members;
drop policy if exists "Owners can manage home_members"               on home_members;

-- home_members (names introduced in 002 / 003)
drop policy if exists "home_members: members can read"   on home_members;
drop policy if exists "home_members: insert"             on home_members;
drop policy if exists "home_members: owners can update"  on home_members;
drop policy if exists "home_members: owners can delete"  on home_members;

-- ============================================================
-- Security definer helpers for home_members
-- (recreate idempotently with CREATE OR REPLACE)
-- ============================================================

-- Returns the calling user's role in a home, or NULL if not a member.
-- Runs as postgres (bypasses RLS) to avoid infinite recursion.
create or replace function get_home_member_role(home_id_param uuid, user_id_param uuid)
returns text as $$
  select role from home_members
  where home_id = home_id_param and user_id = user_id_param
  limit 1
$$ language sql security definer stable;

-- Returns true if the user is the owner_id on the homes row.
-- Used to bootstrap the first membership row during home creation.
create or replace function is_home_creator(home_id_param uuid, user_id_param uuid)
returns boolean as $$
  select exists (
    select 1 from homes where id = home_id_param and owner_id = user_id_param
  )
$$ language sql security definer stable;

-- ============================================================
-- profiles policies
-- ============================================================
create policy "Users can read own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- ============================================================
-- home_members policies
-- ============================================================

-- SELECT: your own row, or any row in a home you belong to
create policy "home_members: members can read"
  on home_members for select using (
    user_id = auth.uid()
    or get_home_member_role(home_id, auth.uid()) is not null
  );

-- INSERT:
--   (a) inserting yourself as owner when you just created the home, OR
--   (b) an existing owner adding a new member
create policy "home_members: insert"
  on home_members for insert with check (
    (user_id = auth.uid() and is_home_creator(home_id, auth.uid()))
    or get_home_member_role(home_id, auth.uid()) = 'owner'
  );

-- UPDATE: owners only
create policy "home_members: owners can update"
  on home_members for update using (
    get_home_member_role(home_id, auth.uid()) = 'owner'
  );

-- DELETE: owners only
create policy "home_members: owners can delete"
  on home_members for delete using (
    get_home_member_role(home_id, auth.uid()) = 'owner'
  );
