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
  const platform = await sql`SELECT id, 'PLATFORM' AS kind, "customerName", service, date, time, location, total AS amount FROM (SELECT b.id, c.name AS "customerName", b.service_name AS service, b.appointment_date::text AS date, b.appointment_time::text AS time, b.event_location AS location, b.total FROM bookings b JOIN auth_users c ON c.id = b.customer_id WHERE b.artist_id = ${user.id} AND b.status NOT IN ('CANCELLED', 'REJECTED')) booking`;
  const outside = await sql`SELECT id, 'OUTSIDE' AS kind, client_name AS "customerName", service_name AS service, appointment_date::text AS date, appointment_time::text AS time, event_location AS location, amount FROM outside_bookings WHERE artist_id = ${user.id}`;
  const premium = await sql`SELECT premium FROM artist_profiles WHERE user_id = ${user.id}`;
  return { events: [...platform, ...outside], premium: Boolean(premium[0]?.["premium"]) };
}

export async function createOutsideBooking(request: Request, input: { clientName: string; clientPhone?: string | undefined; service: string; date: string; time: string; location: string; amount: number; notes?: string | undefined }) {
  const user = await artistAccount(request);
  if (!input.clientName.trim() || !input.service.trim() || !input.date || !input.time || !input.location.trim() || !Number.isInteger(input.amount) || input.amount < 0) throw new Error("Complete all required outside-booking fields.");
  const rows = await database()`INSERT INTO outside_bookings (artist_id, client_name, client_phone, service_name, appointment_date, appointment_time, event_location, amount, notes) VALUES (${user.id}, ${input.clientName.trim()}, ${input.clientPhone?.trim() || null}, ${input.service.trim()}, ${input.date}, ${input.time}, ${input.location.trim()}, ${input.amount}, ${input.notes?.trim() || null}) RETURNING id, 'OUTSIDE'::text AS kind, client_name AS "customerName", service_name AS service, appointment_date::text AS date, appointment_time::text AS time, event_location AS location, amount`;
  return rows[0];
}

export async function deleteOutsideBooking(request: Request, id: string) {
  const user = await artistAccount(request);
  const rows = await database()`DELETE FROM outside_bookings WHERE id = ${id} AND artist_id = ${user.id} RETURNING id`;
  if (!rows[0]) throw new Error("Outside booking not found.");
}

export async function listArtists() {
  return database()`SELECT u.id, COALESCE(NULLIF(to_jsonb(p)->>'artistry_name', ''), u.name) AS name, u.city, p.area, p.tagline, p.verified, p.premium,
    COALESCE(MIN(s.price), 0) AS "startingPrice", COALESCE(array_agg(s.name) FILTER (WHERE s.active), '{}') AS specialties
    FROM artist_profiles p JOIN auth_users u ON u.id = p.user_id LEFT JOIN artist_services s ON s.artist_id = p.user_id
    GROUP BY u.id, p.user_id ORDER BY p.premium DESC, u.name`;
}

export async function artistById(id: string) {
  const sql = database();
  const artists = await sql`SELECT u.id, COALESCE(NULLIF(to_jsonb(p)->>'artistry_name', ''), u.name) AS name, u.city, p.area, p.tagline, p.verified, p.premium,
    COALESCE(MIN(s.price), 0) AS "startingPrice"
    FROM artist_profiles p JOIN auth_users u ON u.id = p.user_id LEFT JOIN artist_services s ON s.artist_id = p.user_id
    WHERE u.id = ${id} GROUP BY u.id, p.user_id`;
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
  return database().query(`SELECT b.id, b.artist_id AS "artistId", b.service_name AS service, b.appointment_date::text AS date, b.appointment_time::text AS time, b.event_location AS location, b.notes, b.total, b.status, COALESCE(NULLIF(p.artistry_name, ''), a.name) AS "artistName", c.name AS "customerName" FROM bookings b JOIN auth_users a ON a.id = b.artist_id LEFT JOIN artist_profiles p ON p.user_id = a.id JOIN auth_users c ON c.id = b.customer_id WHERE b.${owner} = $1 ORDER BY b.appointment_date DESC, b.appointment_time DESC`, [user.id]);
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
