import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Filter, MapPin, Search } from "lucide-react";
import { useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { StatusPill } from "@/components/glam-ui";
import {
  artists,
  bookings,
  inr,
  type BookingStatus,
} from "@/lib/mock-data";

export const Route = createFileRoute("/admin/bookings")({
  head: () => ({
    meta: [
      { title: "Global Bookings Audit | Glowlist Super Admin" },
      {
        name: "description",
        content:
          "System-wide monitoring of all customer-artist makeup bookings and service requests.",
      },
    ],
  }),
  component: AdminBookings,
});

function AdminBookings() {
  const [filterStatus, setFilterStatus] = useState<BookingStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");

  const allBookings = bookings.map((b) => {
    const artist = artists.find((a) => a.id === b.artistId);
    return { ...b, artistName: artist?.name ?? "Makeup Artist", artistArea: artist?.area ?? "" };
  });

  const filtered = allBookings.filter((b) => {
    const matchesStatus = filterStatus === "ALL" || b.status === filterStatus;
    const matchesSearch =
      b.customerName.toLowerCase().includes(search.toLowerCase()) ||
      b.artistName.toLowerCase().includes(search.toLowerCase()) ||
      b.service.toLowerCase().includes(search.toLowerCase()) ||
      b.location.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <AdminShell
      title="Global Bookings Audit & Monitoring"
      subtitle="System-wide Booking Logs, Venue Locations, & Service Tracking"
    >
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search customer, artist, service, or venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 pl-10 pr-4 text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 text-xs no-scrollbar">
          <Filter className="size-4 shrink-0 text-slate-400 mr-1" />
          {(["ALL", "PENDING", "ACCEPTED", "CONFIRMED", "COMPLETED", "CANCELLED"] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-colors ${
                  filterStatus === status
                    ? "bg-pink-600 text-white shadow-md shadow-pink-900/30"
                    : "border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {status === "ALL" ? "All Bookings" : status}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Wide Desktop Bookings Table */}
      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-base font-bold text-white">Live Platform Bookings ({filtered.length})</h3>
          <span className="text-xs font-semibold text-emerald-400">● Live Database Sync Active</span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[0.68rem] tracking-wider">
                <th className="py-3.5 px-4">Booking ID</th>
                <th className="py-3.5 px-4">Service</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Assigned Artist</th>
                <th className="py-3.5 px-4">Appointment Date</th>
                <th className="py-3.5 px-4">Venue Location</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Advance Paid</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-slate-300">{b.id}</td>
                  <td className="py-4 px-4 font-semibold text-white">{b.service}</td>
                  <td className="py-4 px-4 text-slate-300">{b.customerName}</td>
                  <td className="py-4 px-4 text-slate-300">{b.artistName}</td>
                  <td className="py-4 px-4 text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-3 text-pink-400" />
                      <span>
                        {b.date}, {b.time}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-400 max-w-xs truncate">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="size-3 text-purple-400 shrink-0" />
                      <span className="truncate">{b.location}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-bold text-white">{inr(b.total)}</td>
                  <td className="py-4 px-4 font-bold text-pink-400">{inr(b.advance)}</td>
                  <td className="py-4 px-4">
                    <StatusPill status={b.status} />
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
