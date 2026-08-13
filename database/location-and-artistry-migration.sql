-- Run this once in the Neon SQL Editor for databases created before profile
-- fields or artistry names were added. Every statement is safe to run again.
ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS booking_updates BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS artistry_name TEXT;
