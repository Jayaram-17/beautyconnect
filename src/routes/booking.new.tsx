import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { AppShell } from "@/components/app-shell";
import { artists, artistServices, daySlots, inr } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/booking/new")({
  validateSearch: z.object({ artistId: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "New Booking | Glowlist" },
      {
        name: "description",
        content:
          "Pick your services, choose a time slot and pay a 20% advance to confirm your makeup appointment.",
      },
      { property: "og:title", content: "New Booking | Glowlist" },
      {
        property: "og:description",
        content: "Pick services, choose a slot and pay a 20% advance.",
      },
    ],
  }),
  component: NewBooking,
});

const steps = ["Services", "Date & time", "Details", "Pay"];

function NewBooking() {
  const { artistId } = Route.useSearch();
  const artist = artists.find((a) => a.id === artistId) ?? artists[0]!;
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>(["s1"]);
  const [slot, setSlot] = useState<string | null>("09:00");

  const total = artistServices
    .filter((s) => selected.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0);
  const advance = Math.round(total * 0.2);

  return (
    <AppShell title="New booking" subtitle={`with ${artist.name}`}>
      <Link
        to="/artists/$artistId"
        params={{ artistId: artist.id }}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground"
      >
        <ArrowLeft className="size-4" /> Artist profile
      </Link>

      <ol className="flex items-center gap-1">
        {steps.map((s, i) => (
          <li key={s} className="flex-1">
            <div
              className={cn(
                "h-1.5 rounded-full",
                i <= step ? "bg-primary" : "bg-muted",
              )}
            />
            <p
              className={cn(
                "mt-1.5 text-[0.65rem] font-medium",
                i === step ? "text-primary" : "text-muted-foreground",
              )}
            >
              {s}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-5">
        {step === 0 && (
          <div className="flex flex-col gap-2">
            {artistServices.map((s) => {
              const on = selected.includes(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() =>
                    setSelected((v) =>
                      on ? v.filter((x) => x !== s.id) : [...v, s.id],
                    )
                  }
                  className={cn(
                    "surface flex items-center gap-3 p-4 text-left",
                    on && "border-primary",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-5 place-items-center rounded-md border",
                      on && "border-primary bg-primary text-primary-foreground",
                    )}
                  >
                    {on && <Check className="size-3.5" />}
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-medium">{s.name}</span>
                    <span className="block text-xs text-muted-foreground">{s.duration}</span>
                  </span>
                  <span className="text-sm font-semibold text-primary">{inr(s.price)}</span>
                </button>
              );
            })}
          </div>
        )}

        {step === 1 && (
          <div>
            <p className="text-sm font-semibold">Saturday, 22 August</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {daySlots.map((s) => (
                <button
                  key={s.time}
                  disabled={s.state !== "available"}
                  onClick={() => setSlot(s.time)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-medium disabled:opacity-40 disabled:line-through",
                    slot === s.time && "border-primary bg-primary text-primary-foreground",
                  )}
                >
                  {s.time}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Slots lock the moment you request — no one else can take this time.
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium">
              Event location
              <input
                defaultValue="Taj Lands End, Bandra West"
                className="mt-1.5 w-full rounded-2xl border bg-card px-4 py-3 text-sm"
              />
            </label>
            <label className="text-sm font-medium">
              Notes for the artist
              <textarea
                rows={4}
                placeholder="Skin type, inspiration looks, travel instructions…"
                className="mt-1.5 w-full rounded-2xl border bg-card px-4 py-3 text-sm"
              />
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="surface p-4">
            <h3 className="text-sm font-semibold">Summary</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Artist</dt>
                <dd>{artist.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Slot</dt>
                <dd>22 Aug · {slot}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Services</dt>
                <dd>{selected.length} selected</dd>
              </div>
              <div className="flex justify-between border-t pt-2">
                <dt className="text-muted-foreground">Total</dt>
                <dd className="font-semibold">{inr(total)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Advance now (20%)</dt>
                <dd className="font-semibold text-primary">{inr(advance)}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-2">
        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="flex-1 rounded-full border py-3 text-sm font-semibold"
          >
            Back
          </button>
        )}
        {step < steps.length - 1 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            className="flex-[2] rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground"
          >
            Continue · {inr(total)}
          </button>
        ) : (
          <Link
            to="/bookings"
            className="flex-[2] rounded-full bg-primary py-3 text-center text-sm font-semibold text-primary-foreground"
          >
            Pay {inr(advance)} advance
          </Link>
        )}
      </div>
    </AppShell>
  );
}
