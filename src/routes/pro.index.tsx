import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarClock, Crown, Eye, IndianRupee, Star, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { AppShell } from "@/components/app-shell";
import { StatusPill } from "@/components/glam-ui";
import { bookings, earnings, inr } from "@/lib/mock-data";

export const Route = createFileRoute("/pro/")({
  head: () => ({
    meta: [
      { title: "Artist Dashboard | Glowlist Studio" },
      {
        name: "description",
        content:
          "Track earnings, booking requests, profile views and ratings for your makeup artistry business.",
      },
      { property: "og:title", content: "Artist Dashboard | Glowlist Studio" },
      {
        property: "og:description",
        content: "Earnings, requests, profile views and ratings at a glance.",
      },
    ],
  }),
  component: ArtistDashboard,
});

const stats = [
  { label: "This month", value: inr(91000), icon: IndianRupee, tone: "text-success" },
  { label: "Requests", value: "6 new", icon: CalendarClock, tone: "text-primary" },
  { label: "Profile views", value: "1,284", icon: Eye, tone: "text-foreground" },
  { label: "Rating", value: "4.9", icon: Star, tone: "text-gold" },
];

function ArtistDashboard() {
  const pending = bookings.filter((b) => b.status === "PENDING" || b.status === "ACCEPTED");

  return (
    <AppShell title="Dashboard" subtitle="Meher Kapoor · Bandra West">
      <div className="glam-gradient flex items-center gap-3 rounded-3xl p-4 text-primary-foreground">
        <Crown className="size-6 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold">Premium active</p>
          <p className="text-xs opacity-90">Renews 12 Sep · boosted in search</p>
        </div>
        <Link
          to="/pro/subscription"
          className="rounded-full bg-background/20 px-3 py-1.5 text-xs font-semibold"
        >
          Manage
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="surface p-4">
            <s.icon className={`size-4 ${s.tone}`} />
            <p className="mt-2 text-lg font-semibold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="surface mt-4 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Earnings</h2>
          <span className="flex items-center gap-1 text-xs font-semibold text-success">
            <TrendingUp className="size-3.5" /> +32%
          </span>
        </div>
        <div className="mt-3 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={earnings} margin={{ left: 0, right: 0, top: 6, bottom: 0 }}>
              <defs>
                <linearGradient id="earn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                fontSize={11}
                stroke="var(--color-muted-foreground)"
              />
              <Tooltip
                cursor={{ stroke: "var(--color-border)" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--color-border)",
                  background: "var(--color-card)",
                  fontSize: 12,
                }}
                formatter={(v: number) => inr(v)}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--color-chart-1)"
                strokeWidth={2}
                fill="url(#earn)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mb-3 mt-6 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Needs your action</h2>
        <Link to="/pro/bookings" className="text-xs font-medium text-primary">
          See all
        </Link>
      </div>
      <div className="flex flex-col gap-3">
        {pending.map((b) => (
          <div key={b.id} className="surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold">{b.customerName}</h3>
                <p className="text-xs text-muted-foreground">
                  {b.service} · {b.date}, {b.time}
                </p>
              </div>
              <StatusPill status={b.status} />
            </div>
            <p className="mt-2 text-sm font-semibold text-primary">{inr(b.total)}</p>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
