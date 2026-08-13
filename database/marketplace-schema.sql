-- Core marketplace data. Run after auth-schema.sql and profile-migration.sql.
CREATE TABLE IF NOT EXISTS artist_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth_users(id) ON DELETE CASCADE,
  artistry_name TEXT,
  tagline TEXT NOT NULL DEFAULT 'Independent beauty artist',
  area TEXT,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  premium BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS artist_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artist_profiles(user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  price INTEGER NOT NULL CHECK (price >= 0),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE booking_status AS ENUM ('PENDING', 'ACCEPTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REJECTED');

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artist_profiles(user_id),
  customer_id UUID NOT NULL REFERENCES auth_users(id),
  service_name TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  event_location TEXT NOT NULL,
  notes TEXT,
  total INTEGER NOT NULL CHECK (total >= 0),
  advance INTEGER NOT NULL CHECK (advance >= 0),
  status booking_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (artist_id, appointment_date, appointment_time)
);

CREATE TABLE IF NOT EXISTS favorites (
  customer_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES artist_profiles(user_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (customer_id, artist_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bookings_customer_idx ON bookings(customer_id, appointment_date DESC);
CREATE INDEX IF NOT EXISTS bookings_artist_idx ON bookings(artist_id, appointment_date DESC);
CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications(user_id, created_at DESC);
