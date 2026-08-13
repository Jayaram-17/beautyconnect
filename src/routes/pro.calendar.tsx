import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/pro/calendar")({ component: ArtistCalendar });
type Booking = { id: string; customerName: string; service: string; date: string; time: string; location: string; status: string };

function ArtistCalendar() {
  const [bookings, setBookings] = useState<Booking[]>([]); const [error, setError] = useState("");
  useEffect(() => { void fetch("/api/bookings").then(async (response) => { const data = await response.json() as { bookings?: Booking[]; error?: string }; if (!response.ok) throw new Error(data.error); setBookings((data.bookings ?? []).filter((booking) => !["CANCELLED", "REJECTED"].includes(booking.status))); }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load calendar.")); }, []);
  return <AppShell title="Calendar" subtitle="Your confirmed schedule"><p className="surface text-sm text-muted-foreground">Availability controls will appear here once availability is configured. This schedule shows live bookings only.</p>{error && <p className="surface mt-4 text-sm text-destructive">{error}</p>}<div className="mt-4 flex flex-col gap-3">{bookings.map((booking) => <div key={booking.id} className="surface p-4"><p className="text-sm font-semibold">{booking.customerName} · {booking.service}</p><div className="mt-2 grid gap-1 text-xs text-muted-foreground"><span className="flex items-center gap-2"><CalendarDays className="size-3.5" />{booking.date}</span><span className="flex items-center gap-2"><Clock className="size-3.5" />{booking.time}</span><span className="flex items-center gap-2"><MapPin className="size-3.5" />{booking.location}</span></div></div>)}</div>{!error && bookings.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">No upcoming bookings.</p>}</AppShell>;
}
