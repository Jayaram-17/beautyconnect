import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Check, Clock, MapPin, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { ArtistAvatar, StatusPill } from "@/components/glam-ui";
import {
  BOOKING_TRANSITIONS,
  bookings as seed,
  inr,
  type Booking,
  type BookingStatus,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pro/bookings")({
  head: () => ({
    meta: [
      { title: "Booking Requests | Glowlist Studio" },
      {
        name: "description",
        content:
          "Accept or decline incoming makeup bookings, review client details and manage your schedule.",
      },
      { property: "og:title", content: "Booking Requests | Glowlist Studio" },
      {
        property: "og:description",
        content: "Accept or decline incoming bookings and manage your schedule.",
      },
    ],
  }),
  component: ArtistBookings,
});

const tabs: Record<string, BookingStatus[]> = {
  Requests: ["PENDING"],
  Confirmed: ["ACCEPTED", "CONFIRMED"],
  History: ["COMPLETED", "CANCELLED", "REJECTED"],
};

function ArtistBookings() {
  const [list, setList] = useState<Booking[]>(seed);
  const [tab, setTab] = useState<keyof typeof tabs>("Requests");

  const transition = (id: string, next: BookingStatus) => {
    setList((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        if (!BOOKING_TRANSITIONS[b.status].includes(next)) {
          toast.error(`Cannot move ${b.status} → ${next}`);
          return b;
        }
        toast.success(`Booking ${next.toLowerCase()}`);
        return { ...b, status: next };
      }),
    );
  };

  const visible = list.filter((b) => tabs[tab]!.includes(b.status));

  return (
    <AppShell title="Bookings" subtitle="Respond within 12 hours to keep your rank">
      <div className="flex gap-1 rounded-2xl bg-muted p-1">
        {Object.keys(tabs).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as keyof typeof tabs)}
            className={cn(
              "flex-1 rounded-xl py-2 text-sm font-semibold transition-colors",
              tab === t ? "bg-card shadow-soft" : "text-muted-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {visible.map((b) => (
          <div key={b.id} className="surface p-4">
            <div className="flex items-start gap-3">
              <ArtistAvatar initials={b.customerInitials} hue={300} className="size-11" />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold">{b.customerName}</h3>
                <p className="truncate text-xs text-muted-foreground">{b.service}</p>
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
              <span className="text-sm font-semibold">{inr(b.total)}</span>
              {b.status === "PENDING" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => transition(b.id, "REJECTED")}
                    className="flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold text-destructive"
                  >
                    <X className="size-3.5" /> Decline
                  </button>
                  <button
                    onClick={() => transition(b.id, "ACCEPTED")}
                    className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                  >
                    <Check className="size-3.5" /> Accept
                  </button>
                </div>
              )}
              {b.status === "CONFIRMED" && (
                <button
                  onClick={() => transition(b.id, "COMPLETED")}
                  className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                >
                  Mark complete
                </button>
              )}
            </div>
          </div>
        ))}
        {visible.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">All clear here.</p>
        )}
      </div>
    </AppShell>
  );
}
