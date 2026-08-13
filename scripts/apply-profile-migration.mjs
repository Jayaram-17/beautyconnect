import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const envFile = await readFile(new URL("../.env.local", import.meta.url), "utf8");
const connectionString = envFile.match(/^DATABASE_URL=(.+)$/m)?.[1]?.trim();
if (!connectionString) throw new Error("DATABASE_URL is missing from .env.local.");

const sql = neon(connectionString);
await sql.query("ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS phone TEXT");
await sql.query("ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS city TEXT");
await sql.query("ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN NOT NULL DEFAULT TRUE");
await sql.query("ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS booking_updates BOOLEAN NOT NULL DEFAULT TRUE");
await sql.query("ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS artistry_name TEXT");
console.log("Profile migration applied.");
