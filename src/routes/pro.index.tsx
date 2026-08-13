import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, CalendarClock, Crown, IndianRupee, Rocket, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { StatusPill } from "@/components/glam-ui";

export const Route = createFileRoute("/pro/")({ component: ArtistDashboard });

type Dashboard = {
  profile: { name: string; city: string | null };
  totals: { monthlyEarnings: number; pendingRequests: number; completedBookings: number };
  requests: Array<{ id: string; customerName: string; service: string; date: string; time: string; total: number; status: "PENDING" | "ACCEPTED" }>;
};

const inr = (amount: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

function ArtistDashboard() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { void fetch("/api/artists/me/dashboard").then(async (response) => { const data = await response.json() as Dashboard & { error?: string }; if (!response.ok) throw new Error(data.error); setDashboard(data); }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load dashboard.")); }, []);
  const name = dashboard?.profile.name ?? "Your studio";
  const city = dashboard?.profile.city ?? "Add your location";
  const stats = [
    { label: "This month", value: inr(dashboard?.totals.monthlyEarnings ?? 0), icon: IndianRupee, tone: "text-success" },
    { label: "Pending requests", value: String(dashboard?.totals.pendingRequests ?? 0), icon: CalendarClock, tone: "text-primary" },
    { label: "Completed bookings", value: String(dashboard?.totals.completedBookings ?? 0), icon: Star, tone: "text-gold" },
  ];
  return <AppShell title="Dashboard" subtitle={`${name} · ${city}`}>
    <PremiumPromo />
    <div className="mt-4 grid grid-cols-3 gap-3">{stats.map((stat) => <div key={stat.label} className="surface p-3"><stat.icon className={`size-4 ${stat.tone}`} /><p className="mt-2 text-base font-semibold">{stat.value}</p><p className="text-[0.65rem] text-muted-foreground">{stat.label}</p></div>)}</div>
    <div className="mb-3 mt-6 flex items-baseline justify-between"><h2 className="text-lg font-semibold">Needs your action</h2><Link to="/pro/bookings" className="text-xs font-medium text-primary">See all</Link></div>
    {error && <p className="surface text-sm text-destructive">{error}</p>}
    {!dashboard && !error && <p className="surface text-sm text-muted-foreground">Loading your bookings…</p>}
    {dashboard?.requests.length === 0 && <p className="surface text-sm text-muted-foreground">No booking requests yet. They’ll appear here when clients book you.</p>}
    <div className="flex flex-col gap-3">{dashboard?.requests.map((booking) => <div key={booking.id} className="surface p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-semibold">{booking.customerName}</h3><p className="text-xs text-muted-foreground">{booking.service} · {booking.date}, {booking.time}</p></div><StatusPill status={booking.status} /></div><p className="mt-2 text-sm font-semibold text-primary">{inr(booking.total)}</p></div>)}</div>
  </AppShell>;
}

const premiumPerks = [
  { icon: Rocket, title: "Get discovered first", detail: "Move higher in local artist searches." },
  { icon: Star, title: "Earn featured placement", detail: "Stand out in client home-page recommendations." },
  { icon: BarChart3, title: "Know what drives bookings", detail: "See views, enquiries and returning clients." },
];

function PremiumPromo() {
  const [active, setActive] = useState(0);
  useEffect(() => { const timer = window.setInterval(() => setActive((current) => (current + 1) % premiumPerks.length), 4200); return () => window.clearInterval(timer); }, []);
  const perk = premiumPerks[active]!;
  const Icon = perk.icon;
  return <section className="promo-card relative overflow-hidden rounded-3xl p-5 text-primary-foreground"><div key={active} className="animate-promo-in relative z-10"><span className="flex size-10 items-center justify-center rounded-2xl bg-background/15"><Icon className="size-5" /></span><p className="mt-3 flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-[0.16em] opacity-80"><Crown className="size-3" />Premium privilege</p><h2 className="mt-1 font-display text-xl font-semibold">{perk.title}</h2><p className="mt-1 text-xs opacity-90">{perk.detail}</p><Link to="/pro/subscription" className="mt-4 inline-flex rounded-full bg-background px-3.5 py-2 text-xs font-bold text-primary">Explore Premium</Link></div><div className="absolute -right-10 -top-12 size-40 rounded-full bg-gold/30 blur-2xl" /><div className="absolute bottom-5 right-5 flex gap-1.5">{premiumPerks.map((item, index) => <button key={item.title} onClick={() => setActive(index)} aria-label={`Show premium privilege ${index + 1}`} className={`h-1.5 rounded-full ${active === index ? "w-5 bg-background" : "w-1.5 bg-background/45"}`} />)}</div></section>;
}
