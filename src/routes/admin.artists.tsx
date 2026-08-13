import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, CheckCircle2, Crown, MapPin, Search, Star, XCircle } from "lucide-react";
import { useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { artists as initialArtists, inr, type Artist } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/artists")({
  head: () => ({
    meta: [
      { title: "Artist Verifications & Network | Glowlist Super Admin" },
      {
        name: "description",
        content: "Manage makeup artist onboarding, KYC verification badges, and premium listings.",
      },
    ],
  }),
  component: AdminArtists,
});

function AdminArtists() {
  const [artistList, setArtistList] = useState<Artist[]>(initialArtists);
  const [search, setSearch] = useState("");

  const toggleVerification = (id: string) => {
    setArtistList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, verified: !a.verified } : a)),
    );
  };

  const togglePremium = (id: string) => {
    setArtistList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, premium: !a.premium } : a)),
    );
  };

  const filteredArtists = artistList.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.area.toLowerCase().includes(search.toLowerCase()) ||
      a.specialties.some((s) => s.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <AdminShell
      title="Artist Network Directory & KYC Controls"
      subtitle="Identity Verification Badges, Pro Boost Tier Management, & Onboarding Audit"
    >
      {/* Search Input */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3.5 top-3 size-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search artist name, city area, or specialty..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 pl-10 pr-4 text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
      </div>

      {/* Grid of Artists (2 columns on desktop) */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {filteredArtists.map((artist) => (
          <div key={artist.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className="grid size-14 place-items-center rounded-2xl text-base font-bold text-white shadow-md shrink-0"
                    style={{
                      backgroundColor: `hsl(${artist.hue}, 65%, 45%)`,
                    }}
                  >
                    {artist.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-white">{artist.name}</h3>
                      {artist.verified && <BadgeCheck className="size-4 text-pink-400" />}
                      {artist.premium && <Crown className="size-4 text-amber-400" />}
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">{artist.tagline}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                      <MapPin className="size-3.5 text-purple-400" /> {artist.area}, {artist.city} ({artist.distanceKm} km)
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center justify-end gap-1 text-sm font-bold text-white">
                    <Star className="size-4 fill-amber-400 text-amber-400" />
                    <span>{artist.rating}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{artist.reviews} reviews</p>
                  <p className="mt-2 text-xs font-bold text-pink-400">From {inr(artist.startingPrice)}</p>
                </div>
              </div>

              {/* Specialties Tag Cloud */}
              <div className="mt-4 flex flex-wrap gap-1.5 border-t border-slate-800/80 pt-3 text-xs">
                {artist.specialties.map((spec) => (
                  <span
                    key={spec}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-[0.68rem] font-semibold text-slate-300"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Desktop Verification Controls */}
            <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleVerification(artist.id)}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                    artist.verified
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  {artist.verified ? (
                    <>
                      <CheckCircle2 className="size-4" /> KYC Verified
                    </>
                  ) : (
                    <>
                      <XCircle className="size-4" /> Approve KYC
                    </>
                  )}
                </button>

                <button
                  onClick={() => togglePremium(artist.id)}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                    artist.premium
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  <Crown className="size-4" /> {artist.premium ? "Pro Boost Active" : "Grant Pro Boost"}
                </button>
              </div>

              <span className="font-mono text-[0.7rem] font-bold text-slate-500">ID: {artist.id}</span>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
