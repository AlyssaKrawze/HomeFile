-- ── Home-level vendor/contact directory ────────────────────────────────────
CREATE TABLE IF NOT EXISTS home_contacts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  home_id uuid REFERENCES homes(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  company text,
  phone text,
  email text,
  category text,
  notes text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE home_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "home_contacts: members select" ON home_contacts FOR SELECT
  USING (get_home_member_role(home_id, auth.uid()) IS NOT NULL);
CREATE POLICY "home_contacts: owners/managers insert" ON home_contacts FOR INSERT
  WITH CHECK (get_home_member_role(home_id, auth.uid()) IN ('owner','manager'));
CREATE POLICY "home_contacts: owners/managers update" ON home_contacts FOR UPDATE
  USING (get_home_member_role(home_id, auth.uid()) IN ('owner','manager'));
CREATE POLICY "home_contacts: owners/managers delete" ON home_contacts FOR DELETE
  USING (get_home_member_role(home_id, auth.uid()) IN ('owner','manager'));

-- ── Pending member invites ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS home_invites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  home_id uuid REFERENCES homes(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'manager' CHECK (role IN ('owner','manager','limited')),
  permissions jsonb DEFAULT '{}' NOT NULL,
  token text NOT NULL UNIQUE,
  invited_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now() NOT NULL,
  expires_at timestamptz DEFAULT (now() + interval '7 days') NOT NULL,
  accepted_at timestamptz
);
ALTER TABLE home_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "home_invites: owners/managers select" ON home_invites FOR SELECT
  USING (get_home_member_role(home_id, auth.uid()) IN ('owner','manager'));
CREATE POLICY "home_invites: owners/managers insert" ON home_invites FOR INSERT
  WITH CHECK (get_home_member_role(home_id, auth.uid()) IN ('owner','manager'));
CREATE POLICY "home_invites: owners/managers delete" ON home_invites FOR DELETE
  USING (get_home_member_role(home_id, auth.uid()) IN ('owner','manager'));

-- ── Add permissions column to home_members ───────────────────────────────────
ALTER TABLE home_members ADD COLUMN IF NOT EXISTS permissions jsonb DEFAULT '{}' NOT NULL;
