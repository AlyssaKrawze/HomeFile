CREATE TABLE user_onboarding_seen (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  page_key text NOT NULL,
  seen_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, page_key)
);

ALTER TABLE user_onboarding_seen ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own onboarding seen" ON user_onboarding_seen
  FOR ALL USING (user_id = auth.uid());
