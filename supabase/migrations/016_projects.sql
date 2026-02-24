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

-- Many-to-many: project <-> rooms / appliances / members
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

-- RLS for all project tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_appliances ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects: members select" ON projects FOR SELECT
  USING (get_home_member_role(home_id, auth.uid()) IS NOT NULL);
CREATE POLICY "projects: owners/managers insert" ON projects FOR INSERT
  WITH CHECK (get_home_member_role(home_id, auth.uid()) IN ('owner','manager'));
CREATE POLICY "projects: owners/managers update" ON projects FOR UPDATE
  USING (get_home_member_role(home_id, auth.uid()) IN ('owner','manager'));
CREATE POLICY "projects: owners/managers delete" ON projects FOR DELETE
  USING (get_home_member_role(home_id, auth.uid()) IN ('owner','manager'));

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

CREATE POLICY "project_rooms: members select" ON project_rooms FOR SELECT
  USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND get_home_member_role(p.home_id, auth.uid()) IS NOT NULL));
CREATE POLICY "project_rooms: owners/managers insert" ON project_rooms FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND get_home_member_role(p.home_id, auth.uid()) IN ('owner','manager')));
CREATE POLICY "project_rooms: owners/managers delete" ON project_rooms FOR DELETE
  USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND get_home_member_role(p.home_id, auth.uid()) IN ('owner','manager')));

CREATE POLICY "project_appliances: members select" ON project_appliances FOR SELECT
  USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND get_home_member_role(p.home_id, auth.uid()) IS NOT NULL));
CREATE POLICY "project_appliances: owners/managers insert" ON project_appliances FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND get_home_member_role(p.home_id, auth.uid()) IN ('owner','manager')));
CREATE POLICY "project_appliances: owners/managers delete" ON project_appliances FOR DELETE
  USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND get_home_member_role(p.home_id, auth.uid()) IN ('owner','manager')));

CREATE POLICY "project_members: members select" ON project_members FOR SELECT
  USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND get_home_member_role(p.home_id, auth.uid()) IS NOT NULL));
CREATE POLICY "project_members: owners/managers insert" ON project_members FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND get_home_member_role(p.home_id, auth.uid()) IN ('owner','manager')));
CREATE POLICY "project_members: owners/managers delete" ON project_members FOR DELETE
  USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND get_home_member_role(p.home_id, auth.uid()) IN ('owner','manager')));
