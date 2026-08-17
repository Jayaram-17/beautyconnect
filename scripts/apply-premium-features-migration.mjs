import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const envFile = await readFile(new URL("../.env.local", import.meta.url), "utf8");
const connectionString = envFile.match(/^DATABASE_URL=(.+)$/m)?.[1]?.trim();
if (!connectionString) throw new Error("DATABASE_URL is missing from .env.local.");

const sql = neon(connectionString);

await sql.query(`CREATE TABLE IF NOT EXISTS outside_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artist_profiles(user_id) ON DELETE CASCADE,
  client_name TEXT NOT NULL CHECK (char_length(client_name) >= 2),
  client_phone TEXT,
  service_name TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  event_location TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
)`);
await sql.query(`CREATE TABLE IF NOT EXISTS artist_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artist_profiles(user_id) ON DELETE CASCADE,
  customer_id UUID REFERENCES auth_users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
)`);
await sql.query(`CREATE TABLE IF NOT EXISTS reminder_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_kind TEXT NOT NULL CHECK (booking_kind IN ('PLATFORM', 'OUTSIDE')),
  booking_id UUID NOT NULL,
  recipient TEXT NOT NULL,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('24H', '2H')),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (booking_kind, booking_id, recipient, reminder_type)
)`);
await sql.query("CREATE INDEX IF NOT EXISTS outside_bookings_artist_date_idx ON outside_bookings(artist_id, appointment_date)");
await sql.query("CREATE INDEX IF NOT EXISTS artist_reviews_artist_created_idx ON artist_reviews(artist_id, created_at DESC)");

console.log("Premium features migration applied.");
