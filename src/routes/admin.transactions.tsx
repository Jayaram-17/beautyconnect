import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, Filter, Lock, Search, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { StatusPill } from "@/components/glam-ui";
import {
  inr,
  platformTransactions,
  type TransactionStatus,
} from "@/lib/mock-data";

export const Route = createFileRoute("/admin/transactions")({
  head: () => ({
    meta: [
      { title: "Financial Ledger & Escrow | Glowlist Super Admin" },
      {
        name: "description",
        content:
          "Audit payment transactions, escrow status, platform fee cuts, and artist payouts.",
      },
    ],
  }),
  component: AdminTransactions,
});

function AdminTransactions() {
  const [filter, setFilter] = useState<TransactionStatus | "ALL">("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTxns = platformTransactions.filter((t) => {
    const matchesFilter = filter === "ALL" || t.status === filter;
    const matchesSearch =
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.artistName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.service.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalEscrow = platformTransactions
    .filter((t) => t.status === "HELD_IN_ESCROW")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPlatformFees = platformTransactions.reduce((sum, t) => sum + t.platformFee, 0);

  return (
    <AdminShell
      title="Financial Ledger & Escrow Monitoring"
      subtitle="Complete Transaction Audit, Revenue Splits, & Escrow Locks"
    >
      {/* Escrow & Fee Counters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-amber-500/30 bg-slate-900 p-6 shadow-lg border-l-4 border-l-amber-500 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Lock className="size-4 text-amber-400" /> Total Funds Held in Escrow
            </div>
            <p className="mt-2 text-3xl font-extrabold text-amber-400">{inr(totalEscrow)}</p>
            <p className="mt-1 text-xs text-slate-400">Locked safely until booking completion</p>
          </div>
          <div className="grid size-12 place-items-center rounded-2xl bg-amber-500/10 text-amber-400">
            <Lock className="size-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-slate-900 p-6 shadow-lg border-l-4 border-l-emerald-500 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <CreditCard className="size-4 text-emerald-400" /> Platform Fee Revenue (15%)
            </div>
            <p className="mt-2 text-3xl font-extrabold text-emerald-400">{inr(totalPlatformFees)}</p>
            <p className="mt-1 text-xs text-slate-400">Collected platform commission</p>
          </div>
          <div className="grid size-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-400">
            <CreditCard className="size-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search TXN ID, client, artist, or service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 pl-10 pr-4 text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 text-xs no-scrollbar">
          <Filter className="size-4 shrink-0 text-slate-400 mr-1" />
          {(["ALL", "HELD_IN_ESCROW", "COMPLETED", "PROCESSING", "REFUNDED"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-colors ${
                filter === s
                  ? "bg-pink-600 text-white shadow-md shadow-pink-900/30"
                  : "border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {s === "ALL" ? "All Statuses" : s.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Wide Desktop Transaction Table */}
      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
        {filteredTxns.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <ShieldAlert className="mx-auto size-12 opacity-30" />
            <p className="mt-3 text-sm font-semibold text-slate-300">No transactions match your search filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[0.68rem] tracking-wider">
                  <th className="py-3.5 px-4">Txn ID</th>
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Artist</th>
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Advance</th>
                  <th className="py-3.5 px-4">Platform Fee (15%)</th>
                  <th className="py-3.5 px-4">Artist Net Payout</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Risk Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredTxns.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-slate-300">{t.id}</td>
                    <td className="py-4 px-4 font-semibold text-white">{t.customerName}</td>
                    <td className="py-4 px-4 text-slate-300">{t.artistName}</td>
                    <td className="py-4 px-4 text-slate-400">{t.service}</td>
                    <td className="py-4 px-4 font-bold text-white">{inr(t.amount)}</td>
                    <td className="py-4 px-4 text-slate-300">{inr(t.advance)}</td>
                    <td className="py-4 px-4 font-bold text-emerald-400">+{inr(t.platformFee)}</td>
                    <td className="py-4 px-4 font-bold text-pink-400">{inr(t.artistPayout)}</td>
                    <td className="py-4 px-4 text-slate-400">{t.paymentMethod}</td>
                    <td className="py-4 px-4">
                      <StatusPill status={t.status} />
                    </td>
                    <td className="py-4 px-4 text-right">
                      {t.status === "HELD_IN_ESCROW" ? (
                        <button className="rounded-lg bg-amber-500/10 px-2.5 py-1 text-[0.68rem] font-bold text-amber-400 border border-amber-500/20 hover:bg-amber-500/20">
                          🔒 Escrow Locked
                        </button>
                      ) : (
                        <span className="text-[0.68rem] font-mono text-slate-500">Verified</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
