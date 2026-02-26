-- Drag-to-reorder rooms
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;
UPDATE rooms SET sort_order = 0;

-- Room info/notes
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS paint_color text;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS floor_type text;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS dimensions text;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS room_notes text;

-- Room attachments
CREATE TABLE IF NOT EXISTS room_attachments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  home_id uuid REFERENCES homes(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  file_url text NOT NULL,
  file_type text,
  file_size bigint,
  description text,
  include_in_binder boolean DEFAULT true NOT NULL,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE room_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "room_attachments: members can select" ON room_attachments FOR SELECT
  USING (get_home_member_role(home_id, auth.uid()) IS NOT NULL);
CREATE POLICY "room_attachments: owners/managers can insert" ON room_attachments FOR INSERT
  WITH CHECK (get_home_member_role(home_id, auth.uid()) IN ('owner','manager'));
CREATE POLICY "room_attachments: owners/managers can update" ON room_attachments FOR UPDATE
  USING (get_home_member_role(home_id, auth.uid()) IN ('owner','manager'));
CREATE POLICY "room_attachments: owners/managers can delete" ON room_attachments FOR DELETE
  USING (get_home_member_role(home_id, auth.uid()) IN ('owner','manager'));
