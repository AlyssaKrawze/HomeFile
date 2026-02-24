ALTER TABLE appliances ADD COLUMN IF NOT EXISTS include_in_binder boolean DEFAULT true NOT NULL;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS include_in_binder boolean DEFAULT true NOT NULL;
