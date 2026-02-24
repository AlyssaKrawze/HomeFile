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
CREATE POLICY "service_providers: members can select" ON service_providers FOR SELECT
  USING (get_home_member_role(home_id, auth.uid()) IS NOT NULL);
CREATE POLICY "service_providers: owners/managers insert" ON service_providers FOR INSERT
  WITH CHECK (get_home_member_role(home_id, auth.uid()) IN ('owner','manager'));
CREATE POLICY "service_providers: owners/managers delete" ON service_providers FOR DELETE
  USING (get_home_member_role(home_id, auth.uid()) IN ('owner','manager'));
