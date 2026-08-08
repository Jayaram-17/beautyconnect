import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { daySlots } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pro/calendar")({
  head: () => ({
    meta: [
      { title: "Availability Calendar | Glowlist Studio" },
      {
        name: "description",
        content:
          "Open, block and review your makeup appointment slots so clients only book times you can work.",
      },
      { property: "og:title", content: "Availability Calendar | Glowlist Studio" },
      {
        property: "og:description",
        content: "Open, block and review your appointment slots.",
      },
    ],
  }),
  component: ArtistCalendar,
});

const days = ["18", "19", "20", "21", "22", "23", "24"];
const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function ArtistCalendar() {
  const [day, setDay] = useState("22");
  const [slots, setSlots] = useState(daySlots);

  const toggle = (time: string) => {
    setSlots((prev) =>
      prev.map((s) => {
        if (s.time !== time) return s;
        if (s.state === "booked") {
          toast.error("This slot already has a confirmed booking.");
          return s;
        }
        const next = s.state === "available" ? ("blocked" as const) : ("available" as const);
        toast.success(next === "blocked" ? `Blocked ${time}` : `Opened ${time}`);
        return { ...s, state: next };
      }),
    );
  };

  return (
    <AppShell title="Calendar" subtitle="August 2026">
      <div className="hide-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
        {days.map((d, i) => (
          <button
            key={d}
            onClick={() => setDay(d)}
            className={cn(
              "flex w-14 shrink-0 flex-col items-center rounded-2xl border py-3 text-sm transition-colors",
              day === d ? "border-primary bg-primary text-primary-foreground" : "bg-card",
            )}
          >
            <span className="text-[0.65rem] uppercase opacity-80">{dayNames[i]}</span>
            <span className="text-base font-semibold">{d}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-2">
        {slots.map((s) => (
          <button
            key={s.time}
            onClick={() => toggle(s.time)}
            className={cn(
              "flex items-center justify-between rounded-2xl border px-4 py-3.5 text-left text-sm",
              s.state === "available" && "border-success/40 bg-success/10",
              s.state === "booked" && "bg-muted",
              s.state === "blocked" && "border-dashed bg-card",
            )}
          >
            <span className="font-semibold">{s.time}</span>
            <span
              className={cn(
                "text-xs font-semibold uppercase tracking-wider",
                s.state === "available" && "text-success",
                s.state !== "available" && "text-muted-foreground",
              )}
            >
              {s.state === "booked" ? "Booked" : s.state === "blocked" ? "Blocked" : "Open"}
            </span>
          </button>
        ))}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Tap an open slot to block it. Booked slots are locked until the booking is cancelled.
      </p>
    </AppShell>
  );
}
