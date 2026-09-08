import { createFileRoute } from "@tanstack/react-router";
import { Bell, BellRing, CalendarDays, Info, Plus, Send, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pro/calendar")({ component: ArtistCalendar });

type Event = {
  id: string;
  kind: "PLATFORM" | "OUTSIDE";
  customerName: string;
  service: string;
  date: string;
  time: string;
  location: string;
  amount: number;
  advance: number;
};

const inr = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

function ArtistCalendar() {
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState("");
  const [sheet, setSheet] = useState(false);
  const [remindingId, setRemindingId] = useState<string | null>(null);

  const today = new Date();
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(today.toISOString().slice(0, 10));

  const load = () =>
    void fetch("/api/artists/me/calendar")
      .then(async (response) => {
        const data = (await response.json()) as { events?: Event[]; error?: string };
        if (!response.ok) throw new Error(data.error);
        setEvents(data.events ?? []);
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load calendar."));

  useEffect(load, []);

  const days = useMemo(() => {
    const start = new Date(month.getFullYear(), month.getMonth(), 1);
    const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return Array.from({ length: start.getDay() + count }, (_, index) =>
      index < start.getDay() ? null : new Date(month.getFullYear(), month.getMonth(), index - start.getDay() + 1),
    );
  }, [month]);

  const dayEvents = events.filter((event) => event.date === selected);

  const remove = async (event: Event) => {
    if (event.kind !== "OUTSIDE") return;
    try {
      const response = await fetch(`/api/artists/me/outside-bookings/${event.id}`, { method: "DELETE" });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error);
      setEvents((current) => current.filter((item) => item.id !== event.id));
      toast.success("Outside booking deleted");
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Could not delete booking.");
    }
  };

  const handleManualReminder = async (event: Event) => {
    setRemindingId(event.id);
    try {
      const res = await fetch("/api/reminders/trigger", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: event.kind, bookingId: event.id }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to send reminder.");
      toast.success(data.message ?? "Reminder notification dispatched!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send reminder.");
    } finally {
      setRemindingId(null);
    }
  };

  return (
    <AppShell title="Calendar" subtitle="Platform and outside bookings together">
      {/* Reminder System Information Banner */}
      <section className="glam-gradient rounded-3xl p-5 text-primary-foreground">
        <div className="flex items-center gap-2">
          <BellRing className="size-5" />
          <h2 className="font-display text-lg font-semibold">Artist Reminder System</h2>
        </div>
        <p className="mt-1 text-xs opacity-90 leading-relaxed">
          Automated booking reminders are delivered directly to <strong>You (the Artist)</strong> at <strong>24 hours</strong> and <strong>2 hours</strong> prior to every appointment.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-[0.7rem] bg-background/15 rounded-2xl p-3 backdrop-blur-sm">
          <div>
            <p className="font-bold text-amber-200">✓ Platform Bookings</p>
            <p className="opacity-80">Glowlist client appointments</p>
          </div>
          <div>
            <p className="font-bold text-sky-200">✓ Outside Bookings</p>
            <p className="opacity-80">Manual offline client bookings</p>
          </div>
        </div>
      </section>

      <section className="surface mt-4 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
            className="text-sm font-semibold p-1"
          >
            ‹
          </button>
          <h2 className="text-sm font-semibold">
            {month.toLocaleString("en-IN", { month: "long", year: "numeric" })}
          </h2>
          <button
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
            className="text-sm font-semibold p-1"
          >
            ›
          </button>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[0.65rem] text-muted-foreground">
          {"SMTWTFS".split("").map((day, index) => (
            <span key={`${day}-${index}`}>{day}</span>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            if (!date) return <span key={index} />;
            const iso = date.toISOString().slice(0, 10);
            const items = events.filter((event) => event.date === iso);
            return (
              <button
                key={iso}
                onClick={() => setSelected(iso)}
                className={`min-h-11 rounded-xl text-xs ${
                  selected === iso ? "bg-primary text-primary-foreground font-bold" : "hover:bg-accent"
                }`}
              >
                <span>{date.getDate()}</span>
                <span className="mt-1 flex justify-center gap-1">
                  {items.some((item) => item.kind === "PLATFORM") && <i className="size-1.5 rounded-full bg-success" />}
                  {items.some((item) => item.kind === "OUTSIDE") && <i className="size-1.5 rounded-full bg-blue-500" />}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-[0.65rem] text-muted-foreground">
          <i className="mr-1 inline-block size-1.5 rounded-full bg-success" /> Platform Booking
          <i className="ml-3 mr-1 inline-block size-1.5 rounded-full bg-blue-500" /> Outside Booking
        </p>
      </section>

      <button
        onClick={() => setSheet(true)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground"
      >
        <Plus className="size-4" /> Log outside booking
      </button>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <h2 className="mt-6 text-sm font-semibold">
        {new Date(`${selected}T00:00:00`).toLocaleDateString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
      </h2>

      <div className="mt-3 flex flex-col gap-3">
        {dayEvents.map((event) => (
          <article key={event.id} className="surface flex flex-col gap-2 p-3.5">
            <div className="flex items-center gap-3">
              <span
                className={`size-2.5 rounded-full shrink-0 ${
                  event.kind === "PLATFORM" ? "bg-success" : "bg-blue-500"
                }`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">
                    {event.time.slice(0, 5)} · {event.service}
                  </p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold ${
                      event.kind === "PLATFORM"
                        ? "bg-success/15 text-success"
                        : "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    {event.kind}
                  </span>
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  Client: {event.customerName} · {event.location}
                </p>
              </div>
              <span className="text-xs font-semibold">{inr(event.amount)}</span>
            </div>

            <div className="flex items-center justify-between border-t pt-2 mt-1">
              <button
                disabled={remindingId === event.id}
                onClick={() => void handleManualReminder(event)}
                className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
              >
                <Send className="size-3" />
                {remindingId === event.id ? "Sending..." : "Send Reminder"}
              </button>

              {event.kind === "OUTSIDE" && (
                <button
                  onClick={() => void remove(event)}
                  aria-label="Delete outside booking"
                  className="text-xs font-semibold text-destructive flex items-center gap-1 hover:underline"
                >
                  <Trash2 className="size-3.5" /> Delete
                </button>
              )}
            </div>
          </article>
        ))}

        {!dayEvents.length && <p className="py-6 text-center text-sm text-muted-foreground">No bookings on this day.</p>}
      </div>

      {sheet && (
        <OutsideBookingSheet
          selected={selected}
          onClose={() => setSheet(false)}
          onAdded={(event) => {
            setEvents((current) => [...current, event]);
            setSheet(false);
          }}
        />
      )}
    </AppShell>
  );
}

function AmountBox({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) {
  return <div className={cn("rounded-xl border bg-background p-2", accent && "border-primary/30 bg-primary/10")}><p className="text-[0.6rem] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p><p className={cn("mt-0.5 text-xs font-bold", accent && "text-primary")}>{inr(value)}</p></div>;
}

function OutsideBookingSheet({
  selected,
  onClose,
  onAdded,
}: {
  selected: string;
  onClose: () => void;
  onAdded: (event: Event) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [amount, setAmount] = useState("");
  const [advance, setAdvance] = useState("");
  const actualAmount = Number(amount) || 0;
  const advanceAmount = Number(advance) || 0;
  const balanceAmount = Math.max(actualAmount - advanceAmount, 0);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (advanceAmount > actualAmount) {
      toast.error("Advance amount cannot exceed the service charge.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/artists/me/outside-bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          clientName: form.get("clientName"),
          clientPhone: form.get("clientPhone"),
          service: form.get("service"),
          date: selected,
          time: form.get("time"),
          location: form.get("location"),
          amount: actualAmount,
          advance: advance.trim() === "" ? 0 : advanceAmount,
          notes: form.get("notes"),
        }),
      });
      const data = (await response.json()) as { booking?: Event; error?: string };
      if (!response.ok || !data.booking) throw new Error(data.error);
      onAdded(data.booking);
      toast.success("Outside booking added (Reminders active)");
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Could not add booking.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-foreground/35">
      <form onSubmit={submit} className="w-full rounded-t-3xl bg-background p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Log outside booking</h2>
          <button type="button" onClick={onClose} className="text-xs font-semibold text-muted-foreground">
            Close
          </button>
        </div>
        <div className="mt-4 grid gap-2">
          <input required name="clientName" placeholder="Client name" className="h-11 rounded-xl border px-3 text-sm" />
          <input name="clientPhone" placeholder="Client phone / WhatsApp" className="h-11 rounded-xl border px-3 text-sm" />
          <input required name="service" placeholder="Service" className="h-11 rounded-xl border px-3 text-sm" />
          <input required name="time" type="time" defaultValue="10:00" className="h-11 rounded-xl border px-3 text-sm" />
          <input required name="location" placeholder="Location" className="h-11 rounded-xl border px-3 text-sm" />
          <input required name="amount" min="0" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Service charge (₹)" className="h-11 rounded-xl border px-3 text-sm" />
          <input name="advance" min="0" max={actualAmount || undefined} type="number" value={advance} onChange={(event) => setAdvance(event.target.value)} placeholder="Advance amount (₹) — optional" className="h-11 rounded-xl border px-3 text-sm" />
          <div className="grid grid-cols-3 gap-2 rounded-2xl border bg-muted/30 p-2.5 text-center"><AmountBox label="Actual" value={actualAmount} /><AmountBox label="Advance" value={advanceAmount} accent /><AmountBox label="Balance" value={balanceAmount} /></div>
          <textarea name="notes" placeholder="Notes" className="rounded-xl border p-3 text-sm" />
        </div>
        <button
          disabled={saving}
          className="mt-4 h-11 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save booking & enable reminders"}
        </button>
      </form>
    </div>
  );
}
