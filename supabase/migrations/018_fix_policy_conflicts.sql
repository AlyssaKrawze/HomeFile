-- Migration 018: safely recreate everything from 015-017
-- Drops all policies with IF NOT EXISTS guards, then re-creates tables and policies.
-- Tables use CREATE TABLE IF NOT EXISTS so existing data is preserved.

-- ============================================================
-- 015: service_providers
-- ============================================================

CREATE TABLE IF NOT EXISTS service_providers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  appliance_id uuid REFERENCES appliances(id) ON DELETE CASCADE NOT NULL,
  home_id uuid REFERENCES homes(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  company text,
  phone text,
  email text,
  notes text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_providers: members can select" ON service_providers;
DROP POLICY IF EXISTS "service_providers: owners/managers insert" ON service_providers;
DROP POLICY IF EXISTS "service_providers: owners/managers delete" ON service_providers;

CREATE POLICY "service_providers: members can select" ON service_providers FOR SELECT
  USING (get_home_member_role(home_id, auth.uid()) IS NOT NULL);
CREATE POLICY "service_providers: owners/managers insert" ON service_providers FOR INSERT
  WITH CHECK (get_home_member_role(home_id, auth.uid()) IN ('owner','manager'));
CREATE POLICY "service_providers: owners/managers delete" ON service_providers FOR DELETE
  USING (get_home_member_role(home_id, auth.uid()) IN ('owner','manager'));

-- ============================================================
-- 016: projects, project_tasks, project_rooms, project_appliances, project_members
-- ============================================================

CREATE TABLE IF NOT EXISTS projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  home_id uuid REFERENCES homes(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','in_progress','complete')),
  due_date date,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS project_tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  home_id uuid REFERENCES homes(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed')),
  assigned_to uuid REFERENCES profiles(id),
  due_date date,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS project_rooms (
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (project_id, room_id)
);

CREATE TABLE IF NOT EXISTS project_appliances (
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  appliance_id uuid REFERENCES appliances(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (project_id, appliance_id)
);

CREATE TABLE IF NOT EXISTS project_members (
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (project_id, user_id)
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_appliances ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- projects policies
DROP POLICY IF EXISTS "projects: members select" ON projects;
DROP POLICY IF EXISTS "projects: owners/managers insert" ON projects;
DROP POLICY IF EXISTS "projects: owners/managers update" ON projects;
DROP POLICY IF EXISTS "projects: owners/managers delete" ON projects;

CREATE POLICY "projects: members select" ON projects FOR SELECT
  USING (get_home_member_role(home_id, auth.uid()) IS NOT NULL);
CREATE POLICY "projects: owners/managers insert" ON projects FOR INSERT
  WITH CHECK (get_home_member_role(home_id, auth.uid()) IN ('owner','manager'));
CREATE POLICY "projects: owners/managers update" ON projects FOR UPDATE
  USING (get_home_member_role(home_id, auth.uid()) IN ('owner','manager'));
CREATE POLICY "projects: owners/managers delete" ON projects FOR DELETE
  USING (get_home_member_role(home_id, auth.uid()) IN ('owner','manager'));

-- project_tasks policies
DROP POLICY IF EXISTS "project_tasks: members select" ON project_tasks;
DROP POLICY IF EXISTS "project_tasks: owners/managers insert" ON project_tasks;
DROP POLICY IF EXISTS "project_tasks: owners/managers update" ON project_tasks;
DROP POLICY IF EXISTS "project_tasks: assignees update" ON project_tasks;
DROP POLICY IF EXISTS "project_tasks: owners/managers delete" ON project_tasks;

CREATE POLICY "project_tasks: members select" ON project_tasks FOR SELECT
  USING (get_home_member_role(home_id, auth.uid()) IS NOT NULL);
CREATE POLICY "project_tasks: owners/managers insert" ON project_tasks FOR INSERT
  WITH CHECK (get_home_member_role(home_id, auth.uid()) IN ('owner','manager'));
CREATE POLICY "project_tasks: owners/managers update" ON project_tasks FOR UPDATE
  USING (get_home_member_role(home_id, auth.uid()) IN ('owner','manager'));
CREATE POLICY "project_tasks: assignees update" ON project_tasks FOR UPDATE
  USING (assigned_to = auth.uid());
CREATE POLICY "project_tasks: owners/managers delete" ON project_tasks FOR DELETE
  USING (get_home_member_role(home_id, auth.uid()) IN ('owner','manager'));

-- project_rooms policies
DROP POLICY IF EXISTS "project_rooms: members select" ON project_rooms;
DROP POLICY IF EXISTS "project_rooms: owners/managers insert" ON project_rooms;
DROP POLICY IF EXISTS "project_rooms: owners/managers delete" ON project_rooms;

CREATE POLICY "project_rooms: members select" ON project_rooms FOR SELECT
  USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND get_home_member_role(p.home_id, auth.uid()) IS NOT NULL));
CREATE POLICY "project_rooms: owners/managers insert" ON project_rooms FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND get_home_member_role(p.home_id, auth.uid()) IN ('owner','manager')));
CREATE POLICY "project_rooms: owners/managers delete" ON project_rooms FOR DELETE
  USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND get_home_member_role(p.home_id, auth.uid()) IN ('owner','manager')));

-- project_appliances policies
DROP POLICY IF EXISTS "project_appliances: members select" ON project_appliances;
DROP POLICY IF EXISTS "project_appliances: owners/managers insert" ON project_appliances;
DROP POLICY IF EXISTS "project_appliances: owners/managers delete" ON project_appliances;

CREATE POLICY "project_appliances: members select" ON project_appliances FOR SELECT
  USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND get_home_member_role(p.home_id, auth.uid()) IS NOT NULL));
CREATE POLICY "project_appliances: owners/managers insert" ON project_appliances FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND get_home_member_role(p.home_id, auth.uid()) IN ('owner','manager')));
CREATE POLICY "project_appliances: owners/managers delete" ON project_appliances FOR DELETE
  USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND get_home_member_role(p.home_id, auth.uid()) IN ('owner','manager')));

-- project_members policies
DROP POLICY IF EXISTS "project_members: members select" ON project_members;
DROP POLICY IF EXISTS "project_members: owners/managers insert" ON project_members;
DROP POLICY IF EXISTS "project_members: owners/managers delete" ON project_members;

CREATE POLICY "project_members: members select" ON project_members FOR SELECT
  USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND get_home_member_role(p.home_id, auth.uid()) IS NOT NULL));
CREATE POLICY "project_members: owners/managers insert" ON project_members FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND get_home_member_role(p.home_id, auth.uid()) IN ('owner','manager')));
CREATE POLICY "project_members: owners/managers delete" ON project_members FOR DELETE
  USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND get_home_member_role(p.home_id, auth.uid()) IN ('owner','manager')));

-- ============================================================
-- 017: include_in_binder columns (idempotent ADD COLUMN IF NOT EXISTS)
-- ============================================================

ALTER TABLE appliances ADD COLUMN IF NOT EXISTS include_in_binder boolean DEFAULT true NOT NULL;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS include_in_binder boolean DEFAULT true NOT NULL;
