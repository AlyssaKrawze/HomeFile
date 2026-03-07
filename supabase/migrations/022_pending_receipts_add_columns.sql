-- Add missing columns that the scan receipt API route expects
alter table pending_receipts add column if not exists store_vendor text;
alter table pending_receipts add column if not exists warranty_expiry date;
alter table pending_receipts add column if not exists warranty_provider text;
alter table pending_receipts add column if not exists warranty_contact text;
alter table pending_receipts add column if not exists scanned_by uuid references auth.users(id);
