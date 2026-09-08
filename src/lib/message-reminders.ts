import { currentUser, database } from "./auth-server";

/**
 * Helper to send a WhatsApp message to the artist via CallMeBot.
 * Looks up callmebot_phone and callmebot_apikey from artist_profiles.
 * Silently fails if credentials are not set.
 */
async function sendArtistWhatsApp(sql: ReturnType<typeof database>, artistId: string, message: string) {
  try {
    const rows = await sql`SELECT callmebot_phone, callmebot_apikey FROM artist_profiles WHERE user_id = ${artistId}`;
    const phone = rows[0]?.["callmebot_phone"] as string | null;
    const apikey = rows[0]?.["callmebot_apikey"] as string | null;
    if (!phone || !apikey) return;

    const encodedMessage = encodeURIComponent(message);
    await fetch(`https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodedMessage}&apikey=${apikey}`).catch(() => null);
  } catch {
    // Silently ignore — WhatsApp is best-effort
  }
}

/**
 * Run every 15 minutes from a host scheduler by calling POST /api/reminders/run.
 * Sends automated reminders to the ARTIST for both PLATFORM and OUTSIDE bookings.
 * Notifications go to: in-app + WhatsApp (if CallMeBot configured).
 */
export async function sendBookingReminders() {
  const sql = database();
  const platformBookings = await sql`
    SELECT b.id, c.name AS "clientName", b.service_name AS service, b.artist_id AS "artistId",
           b.appointment_date::text AS date, b.appointment_time::text AS time,
           CASE WHEN (b.appointment_date + b.appointment_time) BETWEEN now() + interval '23 hours 45 minutes' AND now() + interval '24 hours 15 minutes' THEN '24H' ELSE '2H' END AS "reminderType"
    FROM bookings b
    JOIN auth_users c ON c.id = b.customer_id
    WHERE b.status NOT IN ('CANCELLED', 'REJECTED')
      AND ((b.appointment_date + b.appointment_time) BETWEEN now() + interval '23 hours 45 minutes' AND now() + interval '24 hours 15 minutes'
        OR (b.appointment_date + b.appointment_time) BETWEEN now() + interval '1 hour 45 minutes' AND now() + interval '2 hours 15 minutes')
  `;

  const outsideBookings = await sql`
    SELECT o.id, o.client_name AS "clientName", o.service_name AS service,
           o.artist_id AS "artistId", o.appointment_date::text AS date, o.appointment_time::text AS time,
           CASE WHEN (o.appointment_date + o.appointment_time) BETWEEN now() + interval '23 hours 45 minutes' AND now() + interval '24 hours 15 minutes' THEN '24H' ELSE '2H' END AS "reminderType"
    FROM outside_bookings o
    WHERE ((o.appointment_date + o.appointment_time) BETWEEN now() + interval '23 hours 45 minutes' AND now() + interval '24 hours 15 minutes'
      OR (o.appointment_date + o.appointment_time) BETWEEN now() + interval '1 hour 45 minutes' AND now() + interval '2 hours 15 minutes')
  `;

  let sent = 0;

  for (const booking of platformBookings) {
    const reminderType = String(booking["reminderType"]);
    const artistId = String(booking["artistId"]);
    const logged = await sql`SELECT 1 FROM reminder_logs WHERE booking_kind = 'PLATFORM' AND booking_id = ${String(booking["id"])}::uuid AND recipient = 'ARTIST' AND reminder_type = ${reminderType}`;
    if (logged.length) continue;

    const message = `Reminder: Upcoming platform booking with ${booking["clientName"]} for ${booking["service"]} is in ${reminderType === "2H" ? "about 2 hours" : "about 24 hours"} (${booking["date"]} ${booking["time"]}).`;
    await sql`INSERT INTO notifications (user_id, title, body) VALUES (${artistId}::uuid, 'Artist Booking Reminder', ${message})`;
    await sql`INSERT INTO reminder_logs (booking_kind, booking_id, recipient, reminder_type) VALUES ('PLATFORM', ${String(booking["id"])}::uuid, 'ARTIST', ${reminderType})`;
    await sendArtistWhatsApp(sql, artistId, message);
    sent += 1;
  }

  for (const booking of outsideBookings) {
    const reminderType = String(booking["reminderType"]);
    const artistId = String(booking["artistId"]);
    const logged = await sql`SELECT 1 FROM reminder_logs WHERE booking_kind = 'OUTSIDE' AND booking_id = ${String(booking["id"])}::uuid AND recipient = 'ARTIST' AND reminder_type = ${reminderType}`;
    if (logged.length) continue;

    const message = `Reminder: Upcoming outside booking with ${booking["clientName"]} for ${booking["service"]} is in ${reminderType === "2H" ? "about 2 hours" : "about 24 hours"} (${booking["date"]} ${booking["time"]}).`;
    await sql`INSERT INTO notifications (user_id, title, body) VALUES (${artistId}::uuid, 'Artist Outside Booking Reminder', ${message})`;
    await sql`INSERT INTO reminder_logs (booking_kind, booking_id, recipient, reminder_type) VALUES ('OUTSIDE', ${String(booking["id"])}::uuid, 'ARTIST', ${reminderType})`;
    await sendArtistWhatsApp(sql, artistId, message);
    sent += 1;
  }

  return { sent };
}

/**
 * Manually trigger an immediate reminder for the ARTIST for a specific booking.
 * Sends both in-app notification and WhatsApp (if configured).
 */
export async function triggerManualArtistReminder(request: Request, kind: "PLATFORM" | "OUTSIDE", bookingId: string) {
  const user = await currentUser(request);
  if (!user || user.role !== "ARTIST") throw new Error("Only artists can trigger reminders.");
  const sql = database();

  if (kind === "PLATFORM") {
    const rows = await sql`
      SELECT b.id, c.name AS "clientName", b.service_name AS service, b.appointment_date::text AS date, b.appointment_time::text AS time, b.event_location AS location
      FROM bookings b
      JOIN auth_users c ON c.id = b.customer_id
      WHERE b.id = ${bookingId}::uuid AND b.artist_id = ${user.id}
    `;
    if (!rows[0]) throw new Error("Platform booking not found.");
    const b = rows[0];
    const message = `Manual Reminder: Platform appointment with ${b["clientName"]} for ${b["service"]} on ${b["date"]} at ${b["time"]} (${b["location"]}).`;
    await sql`INSERT INTO notifications (user_id, title, body) VALUES (${user.id}, 'Artist Booking Reminder', ${message})`;
    await sendArtistWhatsApp(sql, user.id, message);
    return { success: true, message: `Reminder sent to your notifications & WhatsApp for ${b["clientName"]}'s booking!` };
  } else {
    const rows = await sql`
      SELECT o.id, o.client_name AS "clientName", o.service_name AS service, o.appointment_date::text AS date, o.appointment_time::text AS time, o.event_location AS location
      FROM outside_bookings o
      WHERE o.id = ${bookingId}::uuid AND o.artist_id = ${user.id}
    `;
    if (!rows[0]) throw new Error("Outside booking not found.");
    const o = rows[0];
    const message = `Manual Reminder: Outside appointment with ${o["clientName"]} for ${o["service"]} on ${o["date"]} at ${o["time"]} (${o["location"]}).`;
    await sql`INSERT INTO notifications (user_id, title, body) VALUES (${user.id}, 'Artist Outside Booking Reminder', ${message})`;
    await sendArtistWhatsApp(sql, user.id, message);
    return { success: true, message: `Reminder sent to your notifications & WhatsApp for outside booking ${o["clientName"]}!` };
  }
}

/**
 * Get/update the artist's CallMeBot WhatsApp credentials.
 */
export async function getArtistWhatsAppConfig(request: Request) {
  const user = await currentUser(request);
  if (!user || user.role !== "ARTIST") throw new Error("Only artist accounts.");
  const sql = database();
  const rows = await sql`SELECT callmebot_phone, callmebot_apikey FROM artist_profiles WHERE user_id = ${user.id}`;
  return { phone: (rows[0]?.["callmebot_phone"] as string) ?? "", apikey: (rows[0]?.["callmebot_apikey"] as string) ?? "" };
}

export async function updateArtistWhatsAppConfig(request: Request, input: { phone: string; apikey: string }) {
  const user = await currentUser(request);
  if (!user || user.role !== "ARTIST") throw new Error("Only artist accounts.");
  const sql = database();
  await sql`UPDATE artist_profiles SET callmebot_phone = ${input.phone.trim() || null}, callmebot_apikey = ${input.apikey.trim() || null}, updated_at = now() WHERE user_id = ${user.id}`;
  return { success: true };
}
