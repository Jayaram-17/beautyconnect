import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, Clock, MapPin, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { StatusPill } from "@/components/glam-ui";
import type { BookingStatus } from "@/lib/mock-data";

export const Route = createFileRoute("/bookings/$bookingId")({ component: BookingDetail });
type Booking = { id: string; artistName: string; service: string; date: string; time: string; location: string; notes?: string; total: number; status: BookingStatus };
const inr = (amount: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

function BookingDetail() {
  const { bookingId } = Route.useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { void fetch("/api/bookings").then(async (response) => { const payload = await response.json() as { bookings?: Booking[]; error?: string }; if (!response.ok) throw new Error(payload.error ?? "Could not load booking."); const match = payload.bookings?.find((item) => item.id === bookingId); if (!match) throw new Error("Booking not found."); setBooking(match); }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load booking.")); }, [bookingId]);

  if (!booking) return <AppShell title="Booking" subtitle="Appointment details"><Link to="/bookings" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground"><ArrowLeft className="size-4" /> All bookings</Link><p className="surface text-sm text-muted-foreground">{error || "Loading booking…"}</p></AppShell>;
  const advance = Math.round(booking.total * 0.2);
  return <AppShell title="Booking" subtitle={booking.service}>
    <Link to="/bookings" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground"><ArrowLeft className="size-4" /> All bookings</Link>
    <section className="surface p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-muted-foreground">Your artist</p><h2 className="mt-1 text-lg font-semibold">{booking.artistName}</h2><p className="mt-1 text-sm text-muted-foreground">{booking.service}</p></div><StatusPill status={booking.status} /></div></section>
    <section className="surface mt-3 p-4"><h3 className="text-sm font-semibold">Appointment</h3><div className="mt-3 grid gap-2 text-sm text-muted-foreground"><span className="flex items-center gap-2"><CalendarDays className="size-4" />{booking.date}</span><span className="flex items-center gap-2"><Clock className="size-4" />{booking.time}</span><span className="flex items-center gap-2"><MapPin className="size-4" />{booking.location}</span></div>{booking.notes && <p className="mt-3 border-t pt-3 text-sm text-muted-foreground">{booking.notes}</p>}</section>
    <section className="surface mt-3 p-4"><h3 className="text-sm font-semibold">Payment</h3><dl className="mt-3 space-y-2 text-sm"><div className="flex justify-between"><dt className="text-muted-foreground">Service total</dt><dd>{inr(booking.total)}</dd></div><div className="flex justify-between"><dt className="text-muted-foreground">Advance paid (20%)</dt><dd className="text-success">{inr(advance)}</dd></div><div className="flex justify-between border-t pt-2 font-semibold"><dt>Due on the day</dt><dd>{inr(booking.total - advance)}</dd></div></dl><p className="mt-3 flex items-center gap-1.5 text-[0.7rem] text-muted-foreground"><ShieldCheck className="size-3.5 text-success" />Payments are protected until the appointment is completed.</p></section>
  </AppShell>;
}
