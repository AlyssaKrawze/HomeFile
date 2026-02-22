-- Fix infinite recursion in home_members RLS policies
--
-- Root cause 1 (recursion):
--   home_members SELECT/ALL policies queried home_members themselves,
--   causing infinite recursion whenever any other table's policy
--   joined home_members to check access.
--
-- Root cause 2 (chicken-and-egg INSERT):
--   "Owners can manage home_members" used FOR ALL with a USING clause.
--   PostgreSQL applies USING as WITH CHECK for INSERTs, so inserting the
--   very first owner row (during home creation) was blocked — no owner
--   existed yet to satisfy the check.
--
-- Fix:
--   Two security definer functions bypass RLS when checking membership,
--   breaking both problems. INSERT gets its own policy that allows
--   bootstrapping an owner row when the user created the home.

-- ============================================================
-- 1. Drop all existing home_members policies
-- ============================================================
drop policy if exists "Members can read home_members for their homes" on home_members;
drop policy if exists "Owners can manage home_members" on home_members;
-- Also drop anything left from a partial previous run
drop policy if exists "home_members: members can read" on home_members;
drop policy if exists "home_members: insert" on home_members;
drop policy if exists "home_members: owners can update" on home_members;
drop policy if exists "home_members: owners can delete" on home_members;

-- ============================================================
-- 2. Security definer helpers (execute as postgres, bypass RLS)
-- ============================================================

-- Returns the caller's role in a given home, or NULL if not a member.
create or replace function get_home_member_role(home_id_param uuid, user_id_param uuid)
returns text as $$
  select role from home_members
  where home_id = home_id_param and user_id = user_id_param
  limit 1
$$ language sql security definer stable;

-- Returns true if the user is listed as owner_id in the homes table.
-- Used to bootstrap the first membership row during home creation.
create or replace function is_home_creator(home_id_param uuid, user_id_param uuid)
returns boolean as $$
  select exists (
    select 1 from homes where id = home_id_param and owner_id = user_id_param
  )
$$ language sql security definer stable;

-- ============================================================
-- 3. Recreate home_members policies (no self-reference)
-- ============================================================

-- SELECT: your own row, or any row in a home you already belong to
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
