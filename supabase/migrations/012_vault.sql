CREATE TABLE vault_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  home_id uuid REFERENCES homes(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL CHECK (category IN ('wifi', 'alarm', 'garage', 'gate', 'custom')),
  label text NOT NULL,
  credentials jsonb NOT NULL DEFAULT '{}',
  -- credentials structure per category:
  --   wifi:              { ssid: "plain", password: {ciphertext, iv, authTag} }
  --   alarm/garage/gate: { code: {ciphertext, iv, authTag} }
  --   custom:            { fieldLabel: "plain", fieldValue: {ciphertext, iv, authTag} }
  notes text,
  created_by uuid REFERENCES profiles(id),
  updated_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE vault_pins (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  home_id uuid REFERENCES homes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  pin_hash text NOT NULL,
  salt text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(home_id, user_id)
);

ALTER TABLE vault_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_pins ENABLE ROW LEVEL SECURITY;

-- vault_entries: owners/managers only
CREATE POLICY "vault_entries: owner/manager select" ON vault_entries FOR SELECT
  USING (get_home_member_role(home_id, auth.uid()) IN ('owner', 'manager'));

CREATE POLICY "vault_entries: owner/manager insert" ON vault_entries FOR INSERT
  WITH CHECK (get_home_member_role(home_id, auth.uid()) IN ('owner', 'manager'));

CREATE POLICY "vault_entries: owner/manager update" ON vault_entries FOR UPDATE
  USING (get_home_member_role(home_id, auth.uid()) IN ('owner', 'manager'));

CREATE POLICY "vault_entries: owner/manager delete" ON vault_entries FOR DELETE
  USING (get_home_member_role(home_id, auth.uid()) IN ('owner', 'manager'));

-- vault_pins: each user manages only their own row
CREATE POLICY "vault_pins: own row" ON vault_pins FOR ALL USING (user_id = auth.uid());
