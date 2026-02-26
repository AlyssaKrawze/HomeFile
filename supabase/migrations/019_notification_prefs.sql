-- Migration 019: Add notification preferences to homes table
ALTER TABLE homes ADD COLUMN IF NOT EXISTS notification_prefs jsonb
  DEFAULT '{"month": true, "week": true, "day": false}'::jsonb NOT NULL;
