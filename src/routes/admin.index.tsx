import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  CreditCard,
  DollarSign,
  Send,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { StatusPill } from "@/components/glam-ui";
import {
  inr,
  platformRevenueHistory,
  platformStats,
  platformTransactions,
} from "@/lib/mock-data";
import { sendWeeklyReportToSlack, type WeeklyReportPayload } from "@/lib/weekly-report-job";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Platform Overview | Glowlist Super Admin" },
      {
        name: "description",
        content:
          "Monitor platform GMV, revenue commission, global bookings, and artist KYC approvals.",
      },
    ],
  }),
  component: AdminOverview,
});

function AdminOverview() {
  const recentTxns = platformTransactions.slice(0, 5);
  const [reportResult, setReportResult] = useState<WeeklyReportPayload | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  const triggerReport = async () => {
    setReportLoading(true);
    const res = await sendWeeklyReportToSlack();
    setReportResult(res.payload);
    setReportLoading(false);
  };

  return (
    <AdminShell
      title="Platform Operations Control Center"
      subtitle="Full-Width Development, Financial Audit & Ops Suite"
    >
      {/* Top Banner Card */}
      <div className="rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-purple-700 p-6 text-white shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="grid size-12 place-items-center rounded-2xl bg-white/10 backdrop-blur-md">
            <ShieldCheck className="size-7 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Platform Super-Admin System Active</h2>
            <p className="text-xs text-pink-100 mt-0.5">
              Live financial auditing, escrow checks, artist KYC approvals, and automated reporting.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={triggerReport}
            disabled={reportLoading}
            className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-xs font-bold text-white backdrop-blur-md hover:bg-white/30 transition-all"
          >
            <Send className="size-3.5" />
            {reportLoading ? "Compiling..." : "Run Weekly Report API ⚡"}
          </button>
        </div>
      </div>

      {/* 4-Column Full Desktop KPI Grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Merchandise (GMV)</span>
            <div className="grid size-9 place-items-center rounded-xl bg-pink-500/10 text-pink-400">
              <DollarSign className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-white">{inr(platformStats.totalGmv)}</p>
          <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-emerald-400">
            <TrendingUp className="size-3.5" /> +28.4% growth vs last month
          </p>
        </div>

        {/* KPI 2 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Platform Cut (15%)</span>
            <div className="grid size-9 place-items-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <CreditCard className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-emerald-400">{inr(platformStats.platformRevenue)}</p>
          <p className="mt-1 text-xs text-slate-400">Net platform revenue collected</p>
        </div>

        {/* KPI 3 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Bookings</span>
            <div className="grid size-9 place-items-center rounded-xl bg-blue-500/10 text-blue-400">
              <CalendarDays className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-white">{platformStats.totalBookings}</p>
          <p className="mt-1 text-xs text-slate-400">94.2% completion rate</p>
        </div>

        {/* KPI 4 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Artists</span>
            <div className="grid size-9 place-items-center rounded-xl bg-purple-500/10 text-purple-400">
              <Users className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-white">{platformStats.activeArtists}</p>
          <p className="mt-1 text-xs font-semibold text-amber-400">
            {platformStats.pendingVerifications} pending KYC verification
          </p>
        </div>
      </div>

      {/* Analytics Charts Section (2 Columns on Desktop) */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chart 1: Platform Commission Cut */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Monthly Platform Commission</h3>
              <p className="text-xs text-slate-400 mt-0.5">Net 15% revenue cut collected (INR)</p>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="size-3.5" /> +18.5%
            </span>
          </div>
          <div className="mt-6 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformRevenueHistory} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
                <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="#94a3b8" />
                <Tooltip
                  cursor={{ fill: "#334155" }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #475569",
                    background: "#0f172a",
                    color: "#fff",
                    fontSize: 12,
                  }}
                  formatter={(val: number) => inr(val)}
                />
                <Bar dataKey="commission" fill="#ec4899" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Gross Merchandise Volume Growth */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Gross Merchandise Volume (GMV)</h3>
              <p className="text-xs text-slate-400 mt-0.5">Total customer transaction volume (INR)</p>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-pink-500/10 px-2.5 py-1 text-xs font-bold text-pink-400 border border-pink-500/20">
              <Activity className="size-3.5" /> GMV Trend
            </span>
          </div>
          <div className="mt-6 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={platformRevenueHistory} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gmvGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
                <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="#94a3b8" />
                <Tooltip
                  cursor={{ stroke: "#475569" }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #475569",
                    background: "#0f172a",
                    color: "#fff",
                    fontSize: 12,
                  }}
                  formatter={(val: number) => inr(val)}
                />
                <Area type="monotone" dataKey="gmv" stroke="#8b5cf6" strokeWidth={3} fill="url(#gmvGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* System Ops & Verification Row */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* System Monitoring Column */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500"></span>
              </span>
              <h3 className="text-base font-bold text-white">System Infrastructure & Health Monitors</h3>
            </div>
            <a
              href="/health"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-pink-400 hover:underline"
            >
              /health Probe Endpoint ↗
            </a>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
              <p className="text-[0.68rem] font-medium text-slate-400">UptimeRobot Probe</p>
              <p className="mt-1 font-bold text-emerald-400 text-sm">✓ 99.98% Operational</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
              <p className="text-[0.68rem] font-medium text-slate-400">Sentry Crash Monitor</p>
              <p className="mt-1 font-bold text-white text-sm">0 Production Crashes</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
              <p className="text-[0.68rem] font-medium text-slate-400">GitHub Actions CI/CD</p>
              <p className="mt-1 font-bold text-emerald-400 text-sm">Passing (Branch Main)</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
              <p className="text-[0.68rem] font-medium text-slate-400">Linear Task Sprint</p>
              <p className="mt-1 font-bold text-white text-sm">12 Tickets Shipped</p>
            </div>
          </div>

          {reportResult && (
            <div className="mt-4 rounded-xl border border-purple-500/30 bg-purple-500/10 p-4 text-xs">
              <p className="font-bold text-purple-300">Generated Report Output Preview:</p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-slate-300">
                <p>• Period: {reportResult.period}</p>
                <p>• Completed Bookings: {reportResult.metrics.completedBookings}</p>
                <p>• Cancellation Rate: {reportResult.metrics.cancellationRate}</p>
                <p>• Platform Cut: {inr(reportResult.metrics.platformCommissionCollected)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Verification Queue Column */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-400">
              <BadgeCheck className="size-5" />
              <h3 className="font-bold text-base">Artist KYC Queue</h3>
            </div>
            <p className="mt-2 text-xs text-slate-300">
              3 new makeup artists have submitted Government IDs, portfolios, and store locations for KYC verification.
            </p>
          </div>
          <Link
            to="/admin/artists"
            className="mt-6 flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-all shadow-md"
          >
            Review Artist KYC Directory →
          </Link>
        </div>
      </div>

      {/* Wide Desktop Financial Transactions Table */}
      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white">Recent Transactions Ledger</h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time payment audit log & escrow status</p>
          </div>
          <Link
            to="/admin/transactions"
            className="flex items-center gap-1 text-xs font-bold text-pink-400 hover:underline"
          >
            View Full Financial Ledger <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[0.68rem] tracking-wider">
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Artist</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">15% Platform Cut</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {recentTxns.map((txn) => (
                <tr key={txn.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-300">{txn.id}</td>
                  <td className="py-3.5 px-4 font-semibold text-white">{txn.customerName}</td>
                  <td className="py-3.5 px-4 text-slate-300">{txn.artistName}</td>
                  <td className="py-3.5 px-4 text-slate-400">{txn.service}</td>
                  <td className="py-3.5 px-4 font-bold text-white">{inr(txn.amount)}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-400">{inr(txn.platformFee)}</td>
                  <td className="py-3.5 px-4">
                    <StatusPill status={txn.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
