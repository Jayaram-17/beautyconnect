import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, CalendarClock, CalendarDays, Clock, Crown, IndianRupee, MapPin, MessageCircle, Plus, Scissors, Send, Sparkles, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/pro/")({ component: ArtistDashboard });

type Dashboard = {
  profile: { name: string; city: string | null };
  totals: { monthlyEarnings: number; pendingRequests: number; completedBookings: number };
  requests: Array<{ id: string; customerName: string; service: string; date: string; time: string; total: number; status: "PENDING" | "ACCEPTED" }>;
};

type Event = {
  id: string;
  kind: "PLATFORM" | "OUTSIDE";
  customerName: string;
  service: string;
  date: string;
  time: string;
  location: string;
  amount: number;
};

type Service = { id: string; name: string; durationMinutes: number; price: number; active: boolean };

const inr = (amount: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

function ArtistDashboard() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [servicesCount, setServicesCount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch("/api/artists/me/dashboard")
      .then(async (response) => {
        const data = (await response.json()) as Dashboard & { error?: string };
        if (!response.ok) throw new Error(data.error);
        setDashboard(data);
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load dashboard."));

    void fetch("/api/artists/me/services")
      .then(async (res) => {
        const data = (await res.json()) as { services?: Service[] };
        if (res.ok) {
          const active = (data.services ?? []).filter((s) => s.active).length;
          setServicesCount(active);
        }
      })
      .catch(() => setServicesCount(0));
  }, []);

  const name = dashboard?.profile.name ?? "Your studio";
  const city = dashboard?.profile.city ?? "Add your location";
  const stats = [
    { label: "This month", value: inr(dashboard?.totals.monthlyEarnings ?? 0), icon: IndianRupee, tone: "text-success" },
    { label: "Total Bookings", value: String((dashboard?.totals.completedBookings ?? 0) + (dashboard?.totals.pendingRequests ?? 0)), icon: CalendarDays, tone: "text-primary" },
    { label: "Completed", value: String(dashboard?.totals.completedBookings ?? 0), icon: Star, tone: "text-gold" },
  ];

  return (
    <AppShell title="Dashboard" subtitle={`${name} · ${city}`}>
      {/* Studio Header Banner */}
      <StudioHeaderBanner />

      <div className="mt-4 grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="surface p-3">
            <stat.icon className={`size-4 ${stat.tone}`} />
            <p className="mt-2 text-base font-semibold">{stat.value}</p>
            <p className="text-[0.65rem] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Action Buttons for Artist Business */}
      <StudioQuickActionsHub />

      {/* Upcoming Appointments Timeline & Schedule */}
      <UpcomingScheduleWidget />
    </AppShell>
  );
}

function StudioHeaderBanner() {
  return (
    <section className="promo-card relative overflow-hidden rounded-3xl p-5 text-primary-foreground">
      <div className="relative z-10">
        <span className="flex size-10 items-center justify-center rounded-2xl bg-background/15">
          <Sparkles className="size-5" />
        </span>
        <p className="mt-3 flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-[0.16em] opacity-80">
          <Crown className="size-3 text-gold" />
          Pro Studio Manager
        </p>
        <h2 className="mt-1 font-display text-xl font-semibold">Artist Operating Suite</h2>
        <p className="mt-1 text-xs opacity-90 leading-relaxed">
          Log client appointments, manage your studio calendar, and receive automated CallMeBot WhatsApp reminders.
        </p>
        <div className="mt-4 flex gap-2">
          <Link
            to="/pro/calendar"
            className="inline-flex items-center gap-1.5 rounded-full bg-background px-3.5 py-2 text-xs font-bold text-primary"
          >
            <Plus className="size-3.5" /> Log Booking
          </Link>
          <Link
            to="/settings"
            className="inline-flex items-center gap-1.5 rounded-full bg-background/20 backdrop-blur px-3.5 py-2 text-xs font-bold text-primary-foreground border border-background/30"
          >
            <MessageCircle className="size-3.5" /> Setup WhatsApp
          </Link>
        </div>
      </div>
      <div className="absolute -right-10 -top-12 size-40 rounded-full bg-gold/30 blur-2xl" />
    </section>
  );
}

function StudioQuickActionsHub() {
  const actions = [
    { title: "Log Booking", detail: "Add client appointment", to: "/pro/calendar", icon: Plus, color: "text-primary" },
    { title: "WhatsApp Setup", detail: "CallMeBot reminders", to: "/settings", icon: MessageCircle, color: "text-success" },
    { title: "Studio Insights", detail: "Revenue & analytics", to: "/pro/insights", icon: BarChart3, color: "text-blue-500" },
  ];

  return (
    <section className="mt-4">
      <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Studio Management Actions
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {actions.map((act) => (
          <Link key={act.title} to={act.to} className="surface p-3.5 transition-all hover:bg-accent/40">
            <act.icon className={`size-4 ${act.color}`} />
            <p className="mt-2 text-xs font-bold">{act.title}</p>
            <p className="mt-0.5 text-[0.65rem] text-muted-foreground">{act.detail}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function UpcomingScheduleWidget() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [remindingId, setRemindingId] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/artists/me/calendar")
      .then(async (res) => {
        const data = (await res.json()) as { events?: Event[] };
        if (res.ok) setEvents(data.events ?? []);
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const handleReminder = async (event: Event) => {
    setRemindingId(event.id);
    try {
      const res = await fetch("/api/reminders/trigger", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: event.kind, bookingId: event.id }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to trigger reminder.");
      toast.success(data.message ?? "Reminder notification dispatched!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send reminder.");
    } finally {
      setRemindingId(null);
    }
  };

  const sortedUpcoming = [...events].sort(
    (a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime(),
  );

  return (
    <section className="surface mt-4 p-4">
      <div className="flex items-center justify-between border-b pb-3 mb-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 text-primary" />
          <h2 className="text-sm font-semibold">Upcoming Schedule & Appointments</h2>
        </div>
        <Link to="/pro/calendar" className="text-xs font-semibold text-primary hover:underline">
          Full Calendar →
        </Link>
      </div>

      {loading && <p className="text-xs text-muted-foreground py-4">Loading schedule…</p>}

      {!loading && sortedUpcoming.length > 0 && (
        <div className="space-y-3">
          {sortedUpcoming.slice(0, 4).map((event) => (
            <div key={event.id} className="rounded-2xl border bg-card p-3 shadow-soft transition-all">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full shrink-0 bg-primary" />
                    <p className="truncate text-xs font-bold">{event.service}</p>
                    <span className="rounded-full bg-accent px-1.5 py-0.5 text-[0.6rem] font-bold text-foreground">
                      {event.customerName}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="size-3 shrink-0 text-primary" />
                    {event.date} at {event.time.slice(0, 5)}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground flex items-center gap-1 truncate">
                    <MapPin className="size-3 shrink-0 text-muted-foreground" />
                    {event.location}
                  </p>
                </div>
                <span className="text-xs font-bold shrink-0">{inr(event.amount)}</span>
              </div>

              <div className="mt-2.5 flex items-center justify-between border-t pt-2">
                <button
                  disabled={remindingId === event.id}
                  onClick={() => void handleReminder(event)}
                  className="inline-flex items-center gap-1 text-[0.65rem] font-bold text-primary hover:underline disabled:opacity-50"
                >
                  <Send className="size-3" />
                  {remindingId === event.id ? "Sending..." : "Trigger WhatsApp & App Reminder"}
                </button>
                <span className="text-[0.65rem] text-muted-foreground">Auto-reminder active</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && sortedUpcoming.length === 0 && (
        <div className="py-6 text-center">
          <p className="text-xs text-muted-foreground">No upcoming appointments logged for your studio yet.</p>
          <Link
            to="/pro/calendar"
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-soft"
          >
            <Plus className="size-3.5" /> Log First Appointment
          </Link>
        </div>
      )}
    </section>
  );
}
