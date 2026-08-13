import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  Crown,
  LayoutDashboard,
  Receipt,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { sendWeeklyReportToSlack, type WeeklyReportPayload } from "@/lib/weekly-report-job";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  label: string;
  icon: typeof ShieldCheck;
  exact?: boolean;
};

const adminNavItems: NavItem[] = [
  { to: "/admin", label: "System Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/fraud", label: "Fraud & Risk Detection", icon: ShieldAlert },
  { to: "/admin/transactions", label: "Financials & Escrow", icon: Receipt },
  { to: "/admin/bookings", label: "Global Bookings", icon: CalendarDays },
  { to: "/admin/artists", label: "Artist KYC Network", icon: Users },
];

export function AdminShell({
  title,
  subtitle,
  children,
  headerRight,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  headerRight?: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [showSlackModal, setShowSlackModal] = useState(false);
  const [customWebhookUrl, setCustomWebhookUrl] = useState("");
  const [dispatchStatus, setDispatchStatus] = useState<{
    loading: boolean;
    result?: { success: boolean; message: string; payload: WeeklyReportPayload };
  }>({ loading: false });

  const handleSendSlackReport = async () => {
    setDispatchStatus({ loading: true });
    const res = await sendWeeklyReportToSlack(customWebhookUrl || undefined);
    setDispatchStatus({ loading: false, result: res });
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row">
      {/* Standalone Desktop Sidebar */}
      <aside className="w-full md:w-64 shrink-0 bg-slate-900 border-r border-slate-800/80 flex flex-col justify-between p-5">
        <div>
          {/* Platform Admin Brand Logo */}
          <div className="flex items-center gap-3 px-2 py-3 border-b border-slate-800/80">
            <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 text-white shadow-lg">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-white">Glowlist</h1>
              <p className="text-[0.68rem] font-semibold uppercase tracking-widest text-pink-400">
                Super Admin
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 flex flex-col gap-1.5">
            <p className="px-3 text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">
              Management Suite
            </p>
            {adminNavItems.map((item) => {
              const active = item.exact
                ? pathname === item.to
                : pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all",
                    active
                      ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-900/30"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200",
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer & Role Switcher */}
        <div className="mt-8 pt-4 border-t border-slate-800/80 flex flex-col gap-3">
          <button
            onClick={() => setShowSlackModal(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-3 py-2 text-xs font-bold text-white shadow-lg hover:brightness-110 transition-all"
          >
            <Send className="size-3.5" /> Dispatch Slack Report
          </button>

          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-2.5">
            <p className="text-[0.68rem] font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">
              Role Switcher
            </p>
            <div className="flex items-center justify-between gap-1 text-[0.65rem] font-bold">
              <Link
                to="/"
                className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-slate-800 py-1.5 text-slate-300 hover:text-white transition-colors"
              >
                <Sparkles className="size-3" /> Client
              </Link>
              <Link
                to="/pro"
                className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-slate-800 py-1.5 text-slate-300 hover:text-white transition-colors"
              >
                <Crown className="size-3" /> Artist
              </Link>
              <Link
                to="/admin"
                className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-pink-600 py-1.5 text-white shadow-sm"
              >
                <ShieldCheck className="size-3" /> Admin
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Full-Width Content Container */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
        {/* Standalone Top Bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/90 px-6 py-4 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{title}</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[0.68rem] font-bold text-emerald-400 border border-emerald-500/20">
                <Activity className="size-3" /> 99.98% Uptime
              </span>
            </div>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-3">
            {headerRight}
            <a
              href="/health"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-800/60 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
            >
              <BadgeCheck className="size-3.5 text-emerald-400" /> /health Probe <ArrowUpRight className="size-3" />
            </a>
            <div className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5">
              <div className="size-7 grid place-items-center rounded-lg bg-pink-500/20 text-pink-400 font-bold text-xs">
                OP
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-white">Dev Operations</p>
                <p className="text-[0.65rem] text-slate-400">Super Admin Access</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">{children}</main>
      </div>

      {/* Interactive Slack Dispatch Modal */}
      {showSlackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Send className="size-5 text-purple-400" />
                <h3 className="font-bold text-base text-white">Automated Weekly Slack Report</h3>
              </div>
              <button
                onClick={() => setShowSlackModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-300">
              Generates and dispatches the weekly growth, GMV, 15% platform fee, cancellation rate, and action items report directly to Slack.
            </p>

            <div className="mt-4 flex flex-col gap-2">
              <label className="text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">
                Slack Webhook URL (Optional override)
              </label>
              <input
                type="text"
                placeholder="https://hooks.slack.com/services/..."
                value={customWebhookUrl}
                onChange={(e) => setCustomWebhookUrl(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {dispatchStatus.result && (
              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-xs">
                <p
                  className={cn(
                    "font-bold",
                    dispatchStatus.result.success ? "text-emerald-400" : "text-rose-400",
                  )}
                >
                  {dispatchStatus.result.message}
                </p>
                <div className="mt-2 space-y-1 text-[0.7rem] text-slate-400 font-mono">
                  <p>• Period: {dispatchStatus.result.payload.period}</p>
                  <p>• GMV: ₹{dispatchStatus.result.payload.metrics.grossMerchandiseValue.toLocaleString()}</p>
                  <p>• Commission (15%): ₹{dispatchStatus.result.payload.metrics.platformCommissionCollected.toLocaleString()}</p>
                  <p>• Cancellation Rate: {dispatchStatus.result.payload.metrics.cancellationRate}</p>
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowSlackModal(false)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Close
              </button>
              <button
                onClick={handleSendSlackReport}
                disabled={dispatchStatus.loading}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg hover:brightness-110 disabled:opacity-50"
              >
                {dispatchStatus.loading ? "Generating & Sending..." : "Send Report Now 🚀"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
