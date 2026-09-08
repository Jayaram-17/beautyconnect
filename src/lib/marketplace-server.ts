import { currentUser, database } from "./auth-server";

async function artistAccount(request: Request) {
  const user = await currentUser(request);
  if (!user || user.role !== "ARTIST") throw new Error("Only artist accounts can use this feature.");
  return user;
}

export async function calendarDataFor(request: Request) {
  const user = await currentUser(request);
  if (!user || user.role !== "ARTIST") throw new Error("Only artist accounts can view this calendar.");
  const sql = database();
  const platform = await sql`SELECT id, 'PLATFORM' AS kind, "customerName", service, date, time, location, total AS amount, advance FROM (SELECT b.id, c.name AS "customerName", b.service_name AS service, b.appointment_date::text AS date, b.appointment_time::text AS time, b.event_location AS location, b.total, b.advance FROM bookings b JOIN auth_users c ON c.id = b.customer_id WHERE b.artist_id = ${user.id} AND b.status NOT IN ('CANCELLED', 'REJECTED')) booking`;
  const outside = await sql`SELECT id, 'OUTSIDE' AS kind, client_name AS "customerName", service_name AS service, appointment_date::text AS date, appointment_time::text AS time, event_location AS location, amount, advance FROM outside_bookings WHERE artist_id = ${user.id}`;
  const premium = await sql`SELECT premium FROM artist_profiles WHERE user_id = ${user.id}`;
  return { events: [...platform, ...outside], premium: Boolean(premium[0]?.["premium"]) };
}

export async function createOutsideBooking(request: Request, input: { clientName: string; clientPhone?: string | undefined; service: string; date: string; time: string; location: string; amount: number; advance?: number | undefined; notes?: string | undefined }) {
  const user = await artistAccount(request);
  const advance = input.advance ?? 0;
  if (!input.clientName.trim() || !input.service.trim() || !input.date || !input.time || !input.location.trim() || !Number.isInteger(input.amount) || input.amount < 0 || !Number.isInteger(advance) || advance < 0 || advance > input.amount) throw new Error("Complete all required fields and use an advance no higher than the service charge.");
  const sql = database();
  const rows = await sql`INSERT INTO outside_bookings (artist_id, client_name, client_phone, service_name, appointment_date, appointment_time, event_location, amount, advance, notes) VALUES (${user.id}, ${input.clientName.trim()}, ${input.clientPhone?.trim() || null}, ${input.service.trim()}, ${input.date}, ${input.time}, ${input.location.trim()}, ${input.amount}, ${advance}, ${input.notes?.trim() || null}) RETURNING id, 'OUTSIDE'::text AS kind, client_name AS "customerName", service_name AS service, appointment_date::text AS date, appointment_time::text AS time, event_location AS location, amount, advance`;
  const booking = rows[0];

  // Automatically trigger booking reminder notification for artist
  const message = `Outside Booking Scheduled: ${input.clientName} for ${input.service} on ${input.date} at ${input.time} (${input.location}). Reminders active!`;
  await sql`INSERT INTO notifications (user_id, title, body) VALUES (${user.id}, 'Outside Booking Confirmation', ${message})`;

  return booking;
}

export async function deleteOutsideBooking(request: Request, id: string) {
  const user = await artistAccount(request);
  const rows = await database()`DELETE FROM outside_bookings WHERE id = ${id} AND artist_id = ${user.id} RETURNING id`;
  if (!rows[0]) throw new Error("Outside booking not found.");
}

export async function notificationsFor(request: Request) {
  const user = await currentUser(request);
  if (!user) throw new Error("Please sign in again.");
  const sql = database();
  return sql`SELECT id, title, body, read_at::text AS "readAt", created_at::text AS "createdAt" FROM notifications WHERE user_id = ${user.id} ORDER BY created_at DESC LIMIT 40`;
}

export async function markNotificationsRead(request: Request) {
  const user = await currentUser(request);
  if (!user) throw new Error("Please sign in again.");
  const sql = database();
  await sql`UPDATE notifications SET read_at = now() WHERE user_id = ${user.id} AND read_at IS NULL`;
  return { success: true };
}

export async function artistSubscriptionFor(request: Request) {
  const user = await artistAccount(request);
  const sql = database();
  const rows = await sql`SELECT premium FROM artist_profiles WHERE user_id = ${user.id}`;
  return { premium: Boolean(rows[0]?.["premium"]) };
}

export async function toggleArtistSubscription(request: Request, active: boolean) {
  const user = await artistAccount(request);
  const sql = database();
  await sql`INSERT INTO artist_profiles (user_id, premium) VALUES (${user.id}, ${active}) ON CONFLICT (user_id) DO UPDATE SET premium = ${active}, updated_at = now()`;
  return { premium: active };
}

export async function listArtists() {
  return database()`SELECT u.id, COALESCE(NULLIF(to_jsonb(p)->>'artistry_name', ''), u.name) AS name, u.city, p.area, p.tagline, COALESCE(p.verified, false) AS verified, COALESCE(p.premium, false) AS premium,
    COALESCE(MIN(s.price), 0) AS "startingPrice", COALESCE(array_agg(s.name) FILTER (WHERE s.active), '{}') AS specialties
    FROM auth_users u LEFT JOIN artist_profiles p ON p.user_id = u.id LEFT JOIN artist_services s ON s.artist_id = u.id
    WHERE u.role = 'ARTIST'
    GROUP BY u.id, p.user_id ORDER BY COALESCE(p.premium, false) DESC, u.name`;
}

export async function artistById(id: string) {
  const sql = database();
  const artists = await sql`SELECT u.id, COALESCE(NULLIF(to_jsonb(p)->>'artistry_name', ''), u.name) AS name, u.city, p.area, p.tagline, COALESCE(p.verified, false) AS verified, COALESCE(p.premium, false) AS premium,
    COALESCE(MIN(s.price), 0) AS "startingPrice"
    FROM auth_users u LEFT JOIN artist_profiles p ON p.user_id = u.id LEFT JOIN artist_services s ON s.artist_id = u.id
    WHERE u.id = ${id} AND u.role = 'ARTIST' GROUP BY u.id, p.user_id`;
  if (!artists[0]) return null;
  const services = await sql`SELECT id, name, duration_minutes AS "durationMinutes", price, active FROM artist_services WHERE artist_id = ${id} AND active = true ORDER BY price`;
  return { artist: artists[0], services };
}

export async function favoritesFor(request: Request) {
  const user = await currentUser(request); if (!user) throw new Error("Please sign in again.");
  return database()`SELECT a.* FROM favorites f JOIN LATERAL (
    SELECT u.id, COALESCE(NULLIF(to_jsonb(p)->>'artistry_name', ''), u.name) AS name, u.city, p.area, p.tagline, p.verified, p.premium, COALESCE(MIN(s.price), 0) AS "startingPrice", COALESCE(array_agg(s.name) FILTER (WHERE s.active), '{}') AS specialties
    FROM artist_profiles p JOIN auth_users u ON u.id = p.user_id LEFT JOIN artist_services s ON s.artist_id = p.user_id WHERE u.id = f.artist_id GROUP BY u.id, p.user_id
  ) a ON true WHERE f.customer_id = ${user.id}`;
}

export async function toggleFavorite(request: Request, artistId: string) {
  const user = await currentUser(request); if (!user || user.role !== "USER") throw new Error("Only client accounts can save artists.");
  const sql = database(); const exists = await sql`SELECT 1 FROM favorites WHERE customer_id = ${user.id} AND artist_id = ${artistId}`;
  if (exists.length) { await sql`DELETE FROM favorites WHERE customer_id = ${user.id} AND artist_id = ${artistId}`; return { saved: false }; }
  await sql`INSERT INTO favorites (customer_id, artist_id) VALUES (${user.id}, ${artistId})`; return { saved: true };
}

export async function bookingsFor(request: Request) {
  const user = await currentUser(request); if (!user) throw new Error("Please sign in again.");
  const owner = user.role === "ARTIST" ? "artist_id" : "customer_id";
  return database().query(`SELECT b.id, b.artist_id AS "artistId", b.service_name AS service, b.appointment_date::text AS date, b.appointment_time::text AS time, b.event_location AS location, b.notes, b.total, b.advance, b.status, COALESCE(NULLIF(p.artistry_name, ''), a.name) AS "artistName", c.name AS "customerName" FROM bookings b JOIN auth_users a ON a.id = b.artist_id LEFT JOIN artist_profiles p ON p.user_id = a.id JOIN auth_users c ON c.id = b.customer_id WHERE b.${owner} = $1 ORDER BY b.appointment_date DESC, b.appointment_time DESC`, [user.id]);
}

export async function artistDashboardFor(request: Request) {
  const user = await currentUser(request);
  if (!user || user.role !== "ARTIST") throw new Error("Only artist accounts can view this dashboard.");
  const sql = database();
  const totals = await sql`SELECT
    COALESCE(SUM(total) FILTER (WHERE status IN ('ACCEPTED', 'CONFIRMED', 'COMPLETED') AND appointment_date >= date_trunc('month', CURRENT_DATE)), 0)::int AS "monthlyEarnings",
    COUNT(*) FILTER (WHERE status = 'PENDING')::int AS "pendingRequests",
    COUNT(*) FILTER (WHERE status = 'COMPLETED')::int AS "completedBookings"
    FROM bookings WHERE artist_id = ${user.id}`;
  const requests = await sql`SELECT b.id, b.customer_id AS "customerId", c.name AS "customerName", b.service_name AS service,
    appointment_date::text AS date, appointment_time::text AS time, total, status
    FROM bookings b JOIN auth_users c ON c.id = b.customer_id
    WHERE b.artist_id = ${user.id} AND b.status IN ('PENDING', 'ACCEPTED')
    ORDER BY b.appointment_date, b.appointment_time LIMIT 6`;
  return { profile: { name: user.artistryName || user.name, city: user.city }, totals: totals[0], requests };
}

export async function artistInsightsFor(request: Request) {
  const user = await artistAccount(request);
  const sql = database();
  const premium = await sql`SELECT premium FROM artist_profiles WHERE user_id = ${user.id}`;
  if (!premium[0]?.["premium"]) return { premium: false };

  const summary = await sql`SELECT
    COUNT(*) FILTER (WHERE status NOT IN ('CANCELLED', 'REJECTED'))::int AS "totalBookings",
    COUNT(*) FILTER (WHERE status = 'COMPLETED')::int AS "completedBookings",
    COALESCE(SUM(total) FILTER (WHERE status IN ('ACCEPTED', 'CONFIRMED', 'COMPLETED')), 0)::int AS revenue,
    COALESCE(ROUND(AVG(total) FILTER (WHERE status NOT IN ('CANCELLED', 'REJECTED'))), 0)::int AS "averageOrderValue"
    FROM bookings WHERE artist_id = ${user.id}`;
  const ratings = await sql`SELECT COUNT(*)::int AS reviews, COALESCE(ROUND(AVG(rating)::numeric, 1), 0) AS "averageRating" FROM artist_reviews WHERE artist_id = ${user.id}`;
  const ordersByMonth = await sql`SELECT to_char(month_start, 'Mon') AS month,
    COUNT(b.id) FILTER (WHERE b.status NOT IN ('CANCELLED', 'REJECTED'))::int AS orders,
    COALESCE(SUM(b.total) FILTER (WHERE b.status IN ('ACCEPTED', 'CONFIRMED', 'COMPLETED')), 0)::int AS revenue
    FROM generate_series(date_trunc('month', CURRENT_DATE) - interval '5 months', date_trunc('month', CURRENT_DATE), interval '1 month') AS month_start
    LEFT JOIN bookings b ON b.artist_id = ${user.id} AND date_trunc('month', b.appointment_date) = month_start
    GROUP BY month_start ORDER BY month_start`;
  const reviews = await sql`SELECT customer_name AS "customerName", rating, comment, created_at::text AS "createdAt" FROM artist_reviews WHERE artist_id = ${user.id} ORDER BY created_at DESC LIMIT 5`;
  return { premium: true, summary: { ...summary[0], ...ratings[0] }, ordersByMonth, reviews };
}

export async function artistServicesFor(request: Request) {
  const user = await currentUser(request);
  if (!user || user.role !== "ARTIST") throw new Error("Only artist accounts can manage services.");
  return database()`SELECT id, name, duration_minutes AS "durationMinutes", price, active FROM artist_services WHERE artist_id = ${user.id} ORDER BY created_at DESC`;
}

export async function createArtistService(request: Request, input: { name: string; durationMinutes: number; price: number }) {
  const user = await currentUser(request);
  if (!user || user.role !== "ARTIST") throw new Error("Only artist accounts can manage services.");
  const name = input.name.trim();
  if (name.length < 2 || !Number.isInteger(input.durationMinutes) || input.durationMinutes < 15 || !Number.isInteger(input.price) || input.price < 0) throw new Error("Enter a service name, duration, and valid price.");
  const rows = await database()`INSERT INTO artist_services (artist_id, name, duration_minutes, price) VALUES (${user.id}, ${name}, ${input.durationMinutes}, ${input.price}) RETURNING id, name, duration_minutes AS "durationMinutes", price, active`;
  return rows[0];
}

export async function setArtistServiceActive(request: Request, serviceId: string, active: boolean) {
  const user = await currentUser(request);
  if (!user || user.role !== "ARTIST") throw new Error("Only artist accounts can manage services.");
  const rows = await database()`UPDATE artist_services SET active = ${active} WHERE id = ${serviceId} AND artist_id = ${user.id} RETURNING id, name, duration_minutes AS "durationMinutes", price, active`;
  if (!rows[0]) throw new Error("Service not found.");
  return rows[0];
}

export async function updateArtistService(request: Request, serviceId: string, input: { active?: boolean; price?: number; durationMinutes?: number; name?: string }) {
  const user = await currentUser(request);
  if (!user || user.role !== "ARTIST") throw new Error("Only artist accounts can manage services.");
  const sql = database();
  const current = await sql`SELECT id, name, duration_minutes, price, active FROM artist_services WHERE id = ${serviceId} AND artist_id = ${user.id}`;
  if (!current[0]) throw new Error("Service not found.");

  const nextActive = typeof input.active === "boolean" ? input.active : Boolean(current[0]["active"]);
  const nextPrice = typeof input.price === "number" && input.price >= 0 ? input.price : Number(current[0]["price"]);
  const nextDuration = typeof input.durationMinutes === "number" && input.durationMinutes > 0 ? input.durationMinutes : Number(current[0]["duration_minutes"]);
  const nextName = typeof input.name === "string" && input.name.trim() ? input.name.trim() : String(current[0]["name"]);

  const rows = await sql`UPDATE artist_services SET active = ${nextActive}, price = ${nextPrice}, duration_minutes = ${nextDuration}, name = ${nextName} WHERE id = ${serviceId} AND artist_id = ${user.id} RETURNING id, name, duration_minutes AS "durationMinutes", price, active`;
  return rows[0];
}

export async function createBooking(request: Request, input: { artistId: string; serviceName: string; date: string; time: string; location: string; notes?: string; total: number }) {
  const user = await currentUser(request); if (!user || user.role !== "USER") throw new Error("Only client accounts can create bookings.");
  if (!input.artistId || !input.serviceName || !input.date || !input.time || !input.location || input.total < 0) throw new Error("Please complete the booking details.");
  const sql = database(); const advance = Math.round(input.total * 0.2);
  try { const rows = await sql`INSERT INTO bookings (artist_id, customer_id, service_name, appointment_date, appointment_time, event_location, notes, total, advance) VALUES (${input.artistId}, ${user.id}, ${input.serviceName}, ${input.date}, ${input.time}, ${input.location}, ${input.notes ?? null}, ${input.total}, ${advance}) RETURNING *`;
    await sql`INSERT INTO notifications (user_id, title, body) VALUES (${input.artistId}, 'New booking request', ${`${user.name} requested ${input.serviceName} on ${input.date}.`})`; return rows[0];
  } catch { throw new Error("That time is no longer available. Please choose another slot."); }
}

export async function changeBookingStatus(request: Request, id: string, status: string) {
  const user = await currentUser(request); if (!user) throw new Error("Please sign in again.");
  const allowed = user.role === "ARTIST" ? ["ACCEPTED", "REJECTED", "COMPLETED"] : ["CANCELLED"];
  if (!allowed.includes(status)) throw new Error("This booking action is not allowed.");
  const owner = user.role === "ARTIST" ? "artist_id" : "customer_id";
  const rows = await database().query(`UPDATE bookings SET status = $1, updated_at = now() WHERE id = $2 AND ${owner} = $3 RETURNING *`, [status, id, user.id]);
  if (!rows.length) throw new Error("Booking not found."); return rows[0];
}

export async function updateBookingAdvance(request: Request, id: string, advance: number) {
  const user = await currentUser(request);
  if (!user || user.role !== "ARTIST") throw new Error("Only artist accounts can record an advance payment.");
  if (!Number.isInteger(advance) || advance < 0) throw new Error("Enter a valid advance amount.");
  const rows = await database().query(
    "UPDATE bookings SET advance = $1, updated_at = now() WHERE id = $2 AND artist_id = $3 AND total >= $1 RETURNING *",
    [advance, id, user.id],
  );
  if (!rows.length) throw new Error("Advance cannot exceed the service charge, or the booking was not found.");
  return rows[0];
}
