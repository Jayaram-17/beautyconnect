import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ArtistAvatar, StatusPill } from "@/components/glam-ui";
import { artists, bookings, inr } from "@/lib/mock-data";

export const Route = createFileRoute("/bookings/$bookingId")({
  head: () => ({
    meta: [
      { title: "Booking Details | Glowlist" },
      {
        name: "description",
        content:
          "See your appointment timeline, artist details, payment breakdown and cancellation options.",
      },
      { property: "og:title", content: "Booking Details | Glowlist" },
      {
        property: "og:description",
        content: "Appointment timeline, payment breakdown and cancellation options.",
      },
    ],
  }),
  component: BookingDetail,
});

const timeline = [
  { label: "Request sent", done: true },
  { label: "Artist accepted", done: true },
  { label: "Advance paid", done: true },
  { label: "Appointment", done: false },
  { label: "Review", done: false },
];

function BookingDetail() {
  const { bookingId } = Route.useParams();
  const booking = bookings.find((b) => b.id === bookingId) ?? bookings[0]!;
  const artist = artists.find((a) => a.id === booking.artistId)!;
  const premiumContact = artist.premium;

  return (
    <AppShell title="Booking" subtitle={booking.service}>
      <Link
        to="/bookings"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground"
      >
        <ArrowLeft className="size-4" /> All bookings
      </Link>

      <div className="surface p-4">
        <div className="flex items-center gap-3">
          <ArtistAvatar initials={artist.initials} hue={artist.hue} className="size-12" />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-semibold">{artist.name}</h2>
            <p className="truncate text-xs text-muted-foreground">{artist.tagline}</p>
          </div>
          <StatusPill status={booking.status} />
        </div>
        <div className="mt-4 flex gap-2">
          <Link
            to="/chat/$conversationId"
            params={{ conversationId: artist.id }}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border py-2.5 text-sm font-semibold"
          >
            <MessageCircle className="size-4" /> Chat
          </Link>
          <button
            disabled={!premiumContact}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-40"
          >
            <Phone className="size-4" /> Call
          </button>
        </div>
        {!premiumContact && (
          <p className="mt-2 text-center text-[0.7rem] text-muted-foreground">
            Direct calling is available for premium artists only.
          </p>
        )}
      </div>

      <div className="surface mt-3 p-4">
        <h3 className="text-sm font-semibold">Appointment</h3>
        <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <CalendarDays className="size-4" /> {booking.date}
          </span>
          <span className="flex items-center gap-2">
            <Clock className="size-4" /> {booking.time}
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="size-4" /> {booking.location}
          </span>
        </div>
      </div>

      <div className="surface mt-3 p-4">
        <h3 className="text-sm font-semibold">Progress</h3>
        <ol className="mt-3 space-y-3">
          {timeline.map((step) => (
            <li key={step.label} className="flex items-center gap-3 text-sm">
              <CheckCircle2
                className={
                  step.done ? "size-4 text-success" : "size-4 text-muted-foreground/40"
                }
              />
              <span className={step.done ? "font-medium" : "text-muted-foreground"}>
                {step.label}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="surface mt-3 p-4">
        <h3 className="text-sm font-semibold">Payment</h3>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Service total</dt>
            <dd>{inr(booking.total)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Advance paid (20%)</dt>
            <dd className="text-success">{inr(booking.advance)}</dd>
          </div>
          <div className="flex justify-between border-t pt-2 font-semibold">
            <dt>Due on the day</dt>
            <dd>{inr(booking.total - booking.advance)}</dd>
          </div>
        </dl>
        <p className="mt-3 flex items-center gap-1.5 text-[0.7rem] text-muted-foreground">
          <ShieldCheck className="size-3.5 text-success" /> Payments are protected until the
          appointment is completed.
        </p>
      </div>

      <button className="mt-4 w-full rounded-full border border-destructive/40 py-3 text-sm font-semibold text-destructive">
        Cancel booking
      </button>
    </AppShell>
  );
}
