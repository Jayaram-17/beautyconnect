import { createFileRoute } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ArtistCard } from "@/components/glam-ui";
import type { Artist } from "@/lib/mock-data";

export const Route = createFileRoute("/favorites")({ component: FavoritesPage });

function FavoritesPage() {
  const [saved, setSaved] = useState<Artist[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { void fetch("/api/favorites").then(async (response) => { const data = await response.json() as { artists?: Array<Record<string, unknown>>; error?: string }; if (!response.ok) throw new Error(data.error); setSaved((data.artists ?? []).map(toArtist)); }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load saved artists.")).finally(() => setLoading(false)); }, []);
  return <AppShell title="Saved artists" subtitle={loading ? "Loading your shortlist" : `${saved.length} in your shortlist`}><div className="flex flex-col gap-3">{saved.map((artist) => <ArtistCard key={artist.id} artist={artist} />)}</div>{error && <p className="surface mt-4 text-sm text-destructive">{error}</p>}{!loading && !error && saved.length === 0 && <div className="mt-8 flex flex-col items-center gap-2 rounded-3xl border border-dashed p-6 text-center"><Heart className="size-6 text-primary" /><p className="text-sm text-muted-foreground">No saved artists yet. Tap the heart on an artist profile to keep them handy.</p></div>}</AppShell>;
}

function toArtist(source: Record<string, unknown>): Artist { const name = String(source["name"] ?? "Artist"); return { id: String(source["id"]), name, tagline: String(source["tagline"] ?? "Independent beauty artist"), city: String(source["city"] ?? ""), area: String(source["area"] ?? ""), rating: 0, reviews: 0, startingPrice: Number(source["startingPrice"] ?? 0), distanceKm: 0, premium: Boolean(source["premium"]), verified: Boolean(source["verified"]), specialties: Array.isArray(source["specialties"]) ? source["specialties"].map(String) : [], initials: name.split(" ").map((part) => part[0] ?? "").join("").slice(0, 2), hue: 330 }; }
