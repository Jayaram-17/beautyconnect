import { database } from "./auth-server";

/**
 * Run every 15 minutes from a host scheduler by calling POST /api/reminders/run.
 * The time windows intentionally allow fifteen minutes on either side of the target
 * so a slightly delayed scheduler run still delivers the reminder exactly once.
 */
export async function sendBookingReminders() {
  const sql = database();
  const platformBookings = await sql`SELECT b.id, c.name AS "clientName", b.service_name AS service, b.artist_id AS "artistId", b.customer_id AS "customerId", CASE WHEN (b.appointment_date + b.appointment_time) BETWEEN now() + interval '23 hours 45 minutes' AND now() + interval '24 hours 15 minutes' THEN '24H' ELSE '2H' END AS "reminderType" FROM bookings b JOIN auth_users c ON c.id = b.customer_id WHERE b.status NOT IN ('CANCELLED', 'REJECTED') AND ((b.appointment_date + b.appointment_time) BETWEEN now() + interval '23 hours 45 minutes' AND now() + interval '24 hours 15 minutes' OR (b.appointment_date + b.appointment_time) BETWEEN now() + interval '1 hour 45 minutes' AND now() + interval '2 hours 15 minutes')`;
  const bookings = await sql`SELECT o.id, o.client_name AS "clientName", o.client_phone AS "clientPhone", o.service_name AS service, a.user_id AS "artistId", CASE WHEN (o.appointment_date + o.appointment_time) BETWEEN now() + interval '23 hours 45 minutes' AND now() + interval '24 hours 15 minutes' THEN '24H' ELSE '2H' END AS "reminderType" FROM outside_bookings o JOIN artist_profiles a ON a.user_id = o.artist_id WHERE (o.appointment_date + o.appointment_time) BETWEEN now() + interval '23 hours 45 minutes' AND now() + interval '24 hours 15 minutes' OR (o.appointment_date + o.appointment_time) BETWEEN now() + interval '1 hour 45 minutes' AND now() + interval '2 hours 15 minutes')`;
  let sent = 0;
  const send = async (kind: "PLATFORM" | "OUTSIDE", booking: Record<string, unknown>, recipient: "ARTIST" | "CUSTOMER", userId: unknown, reminderType: string, message: string) => {
    const logged = await sql`SELECT 1 FROM reminder_logs WHERE booking_kind = ${kind} AND booking_id = ${String(booking["id"])}::uuid AND recipient = ${recipient} AND reminder_type = ${reminderType}`;
    if (logged.length) return false;
    await sql`INSERT INTO notifications (user_id, title, body) VALUES (${String(userId)}::uuid, 'Booking reminder', ${message})`;
    await sql`INSERT INTO reminder_logs (booking_kind, booking_id, recipient, reminder_type) VALUES (${kind}, ${String(booking["id"])}::uuid, ${recipient}, ${reminderType})`;
    return true;
  };
  for (const booking of platformBookings) {
    const reminderType = String(booking["reminderType"]);
    const message = `Reminder: your ${booking["service"]} appointment is in ${reminderType === "2H" ? "about 2 hours" : "about 24 hours"}.`;
    if (await send("PLATFORM", booking, "ARTIST", booking["artistId"], reminderType, `${booking["clientName"]}'s ${message}`)) sent += 1;
    if (await send("PLATFORM", booking, "CUSTOMER", booking["customerId"], reminderType, message)) sent += 1;
  }
  for (const booking of bookings) {
    const reminderType = String(booking["reminderType"]);
    const message = `Reminder: ${booking["clientName"]}'s ${booking["service"]} booking is in ${reminderType === "2H" ? "about 2 hours" : "about 24 hours"}.`;
    if (!(await send("OUTSIDE", booking, "ARTIST", booking["artistId"], reminderType, message))) continue;
    const whatsappUrl = process.env["WHATSAPP_API_URL"];
    if (whatsappUrl && booking["clientPhone"]) await fetch(whatsappUrl, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ to: booking["clientPhone"], body: message }) });
    sent += 1;
  }
  return { sent };
}
