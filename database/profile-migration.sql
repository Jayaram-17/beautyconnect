-- Safe to run after auth-schema.sql. Adds account settings fields to existing databases.
ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS booking_updates BOOLEAN NOT NULL DEFAULT TRUE;
