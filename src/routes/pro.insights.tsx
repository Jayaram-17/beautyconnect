import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, Crown, IndianRupee, Lock, ShoppingBag, Star, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/pro/insights")({
  head: () => ({
    meta: [
      { title: "Artist Insights & Analytics | Glowlist Studio" },
      {
        name: "description",
        content: "Track your earnings, completed bookings, order trends, and customer reviews.",
      },
    ],
  }),
  component: ArtistInsightsPage,
});

type InsightsData =
  | { premium: false }
  | {
      premium: true;
      summary: {
        totalBookings: number;
        completedBookings: number;
        revenue: number;
        averageOrderValue: number;
        reviews: number;
        averageRating: number;
      };
      ordersByMonth: Array<{ month: string; orders: number; revenue: number }>;
      reviews: Array<{ customerName: string; rating: number; comment: string; createdAt: string }>;
    };

const inr = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

function ArtistInsightsPage() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch("/api/artists/me/insights")
      .then(async (res) => {
        const payload = (await res.json()) as InsightsData & { error?: string };
        if (!res.ok) throw new Error(payload.error);
        setData(payload);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load insights."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AppShell title="Insights" subtitle="Studio analytics and performance">
        <p className="surface text-sm text-muted-foreground">Loading insights…</p>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="Insights" subtitle="Studio analytics and performance">
        <p className="surface text-sm text-destructive">{error}</p>
      </AppShell>
    );
  }

  // Non-Premium Lock / Upgrade State
  if (!data || !data.premium) {
    return (
      <AppShell title="Insights" subtitle="Studio analytics and performance">
        <div className="glam-gradient rounded-3xl p-6 text-primary-foreground text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-background/20 backdrop-blur-md">
            <Lock className="size-7" />
          </div>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] opacity-85 flex items-center justify-center gap-1">
            <Crown className="size-3.5" /> Premium Privilege
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold">Analytics & Reviews Locked</h2>
          <p className="mt-2 text-xs opacity-90 leading-relaxed max-w-xs mx-auto">
            Detailed revenue graphs, monthly order trends, average order value, and customer reviews are exclusive to Premium subscribers.
          </p>
          <Link
            to="/pro/subscription"
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-background px-6 py-3 text-sm font-bold text-primary shadow-lift hover:opacity-95"
          >
            <Crown className="size-4 text-gold" /> Upgrade to Premium
          </Link>
        </div>

        <div className="surface mt-4 p-5 space-y-4">
          <h3 className="text-sm font-semibold">What you get with Premium Insights:</h3>
          <div className="grid gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="grid size-8 place-items-center rounded-full bg-accent text-primary">
                <TrendingUp className="size-4" />
              </span>
              <div>
                <p className="font-semibold">Revenue & Order Analytics Graphs</p>
                <p className="text-muted-foreground">Monthly breakdown of your earnings and booking volume</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="grid size-8 place-items-center rounded-full bg-accent text-primary">
                <Star className="size-4" />
              </span>
              <div>
                <p className="font-semibold">Customer Ratings & Reviews</p>
                <p className="text-muted-foreground">Check client feedback and average star ratings</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="grid size-8 place-items-center rounded-full bg-accent text-primary">
                <BarChart3 className="size-4" />
              </span>
              <div>
                <p className="font-semibold">Average Order Value & Conversion</p>
                <p className="text-muted-foreground">Understand your pricing performance and customer retention</p>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  // Premium Active Insights State
  const { summary, ordersByMonth, reviews } = data;

  return (
    <AppShell title="Insights" subtitle="Studio analytics, order trends & reviews">
      {/* Summary KPI Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Total Revenue</span>
            <IndianRupee className="size-4 text-success" />
          </div>
          <p className="mt-2 text-xl font-bold">{inr(summary.revenue)}</p>
          <p className="mt-1 text-[0.65rem] text-muted-foreground">Completed & Confirmed</p>
        </div>

        <div className="surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Average Order</span>
            <TrendingUp className="size-4 text-primary" />
          </div>
          <p className="mt-2 text-xl font-bold">{inr(summary.averageOrderValue)}</p>
          <p className="mt-1 text-[0.65rem] text-muted-foreground">Per completed booking</p>
        </div>

        <div className="surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Completed Bookings</span>
            <ShoppingBag className="size-4 text-amber-500" />
          </div>
          <p className="mt-2 text-xl font-bold">{summary.completedBookings}</p>
          <p className="mt-1 text-[0.65rem] text-muted-foreground">{summary.totalBookings} total requests</p>
        </div>

        <div className="surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Average Rating</span>
            <Star className="size-4 fill-gold text-gold" />
          </div>
          <p className="mt-2 text-xl font-bold">{summary.averageRating} ★</p>
          <p className="mt-1 text-[0.65rem] text-muted-foreground">From {summary.reviews} reviews</p>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <section className="surface mt-4 p-4">
        <h3 className="text-sm font-semibold mb-1">Monthly Revenue Trend</h3>
        <p className="text-xs text-muted-foreground mb-4">Earnings over the past 6 months (₹)</p>
        <div className="h-48 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ordersByMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary, #e11d48)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-primary, #e11d48)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(value: number) => [inr(value), "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="var(--color-primary, #e11d48)" strokeWidth={2} fillOpacity={1} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Monthly Orders Bar Chart */}
      <section className="surface mt-4 p-4">
        <h3 className="text-sm font-semibold mb-1">Monthly Booking Volume</h3>
        <p className="text-xs text-muted-foreground mb-4">Number of completed orders per month</p>
        <div className="h-44 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ordersByMonth} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(value: number) => [`${value} orders`, "Orders"]} />
              <Bar dataKey="orders" fill="var(--color-primary, #e11d48)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="surface mt-4 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Client Reviews & Feedback</h3>
          <span className="text-xs text-muted-foreground">{reviews.length} recent reviews</span>
        </div>

        <div className="divide-y">
          {reviews.map((rev, index) => (
            <div key={index} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold">{rev.customerName}</p>
                <span className="flex items-center gap-0.5 text-xs font-bold text-amber-500">
                  <Star className="size-3 fill-gold text-gold" /> {rev.rating}
                </span>
              </div>
              {rev.comment && <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{rev.comment}</p>}
            </div>
          ))}

          {!reviews.length && (
            <p className="py-6 text-center text-xs text-muted-foreground">No customer reviews published yet.</p>
          )}
        </div>
      </section>
    </AppShell>
  );
}

