import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  Filter,
  Globe,
  Lock,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserX,
} from "lucide-react";
import { useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { fraudAlerts as initialFraudAlerts, type FraudAlert } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/fraud")({
  head: () => ({
    meta: [
      { title: "Fake Account & Fraud Detection | Glowlist Super Admin" },
      {
        name: "description",
        content:
          "Automated detection engine for fake makeup artists, fake client accounts, and transaction velocity anomalies.",
      },
    ],
  }),
  component: AdminFraud,
});

function AdminFraud() {
  const [alerts, setAlerts] = useState<FraudAlert[]>(initialFraudAlerts);
  const [filterType, setFilterType] = useState<"ALL" | "ARTIST" | "USER" | "TRANSACTION">("ALL");
  const [search, setSearch] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const handleAction = (id: string, newStatus: "SUSPENDED" | "DISMISSED") => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)),
    );
  };

  const runScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 1200);
  };

  const filtered = alerts.filter((a) => {
    const matchesType = filterType === "ALL" || a.targetType === filterType;
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.reason.toLowerCase().includes(search.toLowerCase()) ||
      a.ipAddress.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const highRiskCount = alerts.filter((a) => a.riskScore >= 80 && a.status === "PENDING_REVIEW").length;
  const suspendedCount = alerts.filter((a) => a.status === "SUSPENDED").length;

  return (
    <AdminShell
      title="Fake Artist & User Fraud Detection Engine"
      subtitle="AI Anomaly Detection, Duplicate Photo Scanners, & Risk Score Monitors"
      headerRight={
        <button
          onClick={runScan}
          disabled={isScanning}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-4 py-2 text-xs font-bold text-white shadow-lg hover:brightness-110 disabled:opacity-50 transition-all"
        >
          <RefreshCw className={`size-3.5 ${isScanning ? "animate-spin" : ""}`} />
          {isScanning ? "Scanning Network..." : "Run Anomaly Scan ⚡"}
        </button>
      }
    >
      {/* Risk Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-rose-500/30 bg-slate-900 p-5 shadow-lg border-l-4 border-l-rose-500 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">High Risk Alerts</span>
            <p className="mt-2 text-3xl font-extrabold text-rose-400">{highRiskCount}</p>
            <p className="mt-1 text-xs text-slate-400">Requires urgent admin action</p>
          </div>
          <div className="grid size-12 place-items-center rounded-2xl bg-rose-500/10 text-rose-400">
            <ShieldAlert className="size-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-slate-900 p-5 shadow-lg border-l-4 border-l-amber-500 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Accounts Suspended</span>
            <p className="mt-2 text-3xl font-extrabold text-amber-400">{suspendedCount}</p>
            <p className="mt-1 text-xs text-slate-400">Blocked from platform search</p>
          </div>
          <div className="grid size-12 place-items-center rounded-2xl bg-amber-500/10 text-amber-400">
            <UserX className="size-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-slate-900 p-5 shadow-lg border-l-4 border-l-emerald-500 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Scan Status</span>
            <p className="mt-2 text-3xl font-extrabold text-emerald-400">Active (24/7)</p>
            <p className="mt-1 text-xs text-slate-400">Tor & VPN exit node inspection</p>
          </div>
          <div className="grid size-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-400">
            <Globe className="size-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search account name, reason, or IP address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 pl-10 pr-4 text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 text-xs">
          <Filter className="size-4 shrink-0 text-slate-400 mr-1" />
          {(["ALL", "ARTIST", "USER", "TRANSACTION"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-colors ${
                filterType === t
                  ? "bg-rose-600 text-white shadow-md shadow-rose-900/30"
                  : "border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {t === "ALL" ? "All Targets" : t}
            </button>
          ))}
        </div>
      </div>

      {/* Fraud Alert Cards List */}
      <div className="mt-6 flex flex-col gap-4">
        {filtered.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-2xl border bg-slate-900 p-6 shadow-lg transition-all ${
              alert.status === "SUSPENDED"
                ? "border-amber-500/30 bg-amber-500/5 opacity-75"
                : alert.riskScore >= 80
                  ? "border-rose-500/40 bg-slate-900"
                  : "border-slate-800"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <span
                  className={`grid size-10 place-items-center rounded-xl font-mono text-xs font-extrabold ${
                    alert.riskScore >= 80
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      : alert.riskScore >= 50
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  }`}
                >
                  {alert.riskScore}
                </span>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-white">{alert.name}</h3>
                    <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[0.65rem] font-bold text-slate-300">
                      {alert.targetType}
                    </span>
                    {alert.status === "SUSPENDED" && (
                      <span className="rounded-md bg-rose-500/20 px-2 py-0.5 text-[0.65rem] font-bold text-rose-400 border border-rose-500/30">
                        SUSPENDED
                      </span>
                    )}
                    {alert.status === "DISMISSED" && (
                      <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[0.65rem] font-bold text-emerald-400 border border-emerald-500/30">
                        DISMISSED
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-rose-400 mt-0.5 flex items-center gap-1">
                    <AlertTriangle className="size-3.5" /> {alert.reason}
                  </p>
                </div>
              </div>

              <div className="text-right text-xs text-slate-400 font-mono">
                <p>IP: {alert.ipAddress}</p>
                <p className="text-[0.68rem] text-slate-500 mt-0.5">{alert.flaggedAt}</p>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-300 bg-slate-950/80 p-3 rounded-xl border border-slate-800 font-sans">
              <span className="font-bold text-slate-400">Detection Audit Evidence: </span>
              {alert.details}
            </p>

            {/* Admin Action Buttons */}
            <div className="mt-4 flex items-center justify-between pt-2">
              <span className="text-[0.7rem] font-mono text-slate-500">ID: {alert.id}</span>

              <div className="flex items-center gap-2">
                {alert.status !== "DISMISSED" && (
                  <button
                    onClick={() => handleAction(alert.id, "DISMISSED")}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
                  >
                    <CheckCircle2 className="size-3.5 text-emerald-400" /> Dismiss & Clear Flag
                  </button>
                )}

                {alert.status !== "SUSPENDED" && (
                  <button
                    onClick={() => handleAction(alert.id, "SUSPENDED")}
                    className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md hover:bg-rose-500 transition-all"
                  >
                    <UserX className="size-3.5" /> Suspend Account
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
