ALTER TABLE scheduled_tasks ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES profiles(id);

-- Drop the existing broad ALL policy, replace with fine-grained ones
DROP POLICY IF EXISTS "Owners and managers can manage scheduled tasks" ON scheduled_tasks;

-- INSERT: owners/managers can assign to anyone; limited users can only self-assign
CREATE POLICY "scheduled_tasks: owners and managers can insert" ON scheduled_tasks FOR INSERT
  WITH CHECK (get_home_member_role(home_id, auth.uid()) IN ('owner', 'manager'));

CREATE POLICY "scheduled_tasks: limited users can self-assign insert" ON scheduled_tasks FOR INSERT
  WITH CHECK (
    get_home_member_role(home_id, auth.uid()) = 'limited'
    AND created_by = auth.uid()
    AND (assigned_to IS NULL OR assigned_to = auth.uid())
  );

-- UPDATE: owners/managers unrestricted; limited users only their own assigned tasks
CREATE POLICY "scheduled_tasks: owners and managers can update" ON scheduled_tasks FOR UPDATE
  USING (get_home_member_role(home_id, auth.uid()) IN ('owner', 'manager'));

CREATE POLICY "scheduled_tasks: assignees can mark complete" ON scheduled_tasks FOR UPDATE
  USING (get_home_member_role(home_id, auth.uid()) = 'limited' AND assigned_to = auth.uid());

-- DELETE: owners/managers only
CREATE POLICY "scheduled_tasks: owners and managers can delete" ON scheduled_tasks FOR DELETE
  USING (get_home_member_role(home_id, auth.uid()) IN ('owner', 'manager'));
