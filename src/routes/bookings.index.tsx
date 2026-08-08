import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { StatusPill } from "@/components/glam-ui";
import { artists, bookings, inr, type BookingStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/bookings/")({
  head: () => ({
    meta: [
      { title: "My Bookings | Glowlist" },
      {
        name: "description",
        content:
          "Track upcoming, completed and cancelled makeup appointments, payments and reminders in one place.",
      },
      { property: "og:title", content: "My Bookings | Glowlist" },
      {
        property: "og:description",
        content: "Track upcoming, completed and cancelled makeup appointments.",
      },
    ],
  }),
  component: BookingsPage,
});

const groups: Record<string, BookingStatus[]> = {
  Upcoming: ["PENDING", "ACCEPTED", "CONFIRMED"],
  Completed: ["COMPLETED"],
  Cancelled: ["CANCELLED", "REJECTED"],
};

function BookingsPage() {
  const [tab, setTab] = useState<keyof typeof groups>("Upcoming");
  const list = bookings.filter((b) => groups[tab]!.includes(b.status));

  return (
    <AppShell title="My bookings" subtitle="Appointments and payments">
      <div className="flex gap-1 rounded-2xl bg-muted p-1">
        {Object.keys(groups).map((g) => (
          <button
            key={g}
            onClick={() => setTab(g as keyof typeof groups)}
            className={cn(
              "flex-1 rounded-xl py-2 text-sm font-semibold transition-colors",
              tab === g ? "bg-card text-foreground shadow-soft" : "text-muted-foreground",
            )}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {list.map((b) => {
          const artist = artists.find((a) => a.id === b.artistId);
          return (
            <div key={b.id} className="surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{b.service}</h3>
                  <p className="text-xs text-muted-foreground">with {artist?.name}</p>
                </div>
                <StatusPill status={b.status} />
              </div>
              <div className="mt-3 grid gap-1.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-2">
                  <CalendarDays className="size-3.5" /> {b.date}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="size-3.5" /> {b.time}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="size-3.5" /> {b.location}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t pt-3">
                <div className="text-sm">
                  <span className="font-semibold">{inr(b.total)}</span>
                  <span className="text-xs text-muted-foreground">
                    {" "}
                    · advance {inr(b.advance)}
                  </span>
                </div>
                <Link
                  to="/bookings/$bookingId"
                  params={{ bookingId: b.id }}
                  className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                >
                  View details
                </Link>
              </div>
            </div>
          );
        })}
        {list.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Nothing here yet.
          </p>
        )}
      </div>
    </AppShell>
  );
}
