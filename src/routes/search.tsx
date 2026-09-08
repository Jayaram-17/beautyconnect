import { createFileRoute } from "@tanstack/react-router";
import { SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ArtistCard } from "@/components/glam-ui";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { inr, serviceCategories, type Artist } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search Makeup Artists | Glowlist" },
      {
        name: "description",
        content:
          "Filter makeup artists by look, budget, rating and distance to find the right match for your event.",
      },
      { property: "og:title", content: "Search Makeup Artists | Glowlist" },
      {
        property: "og:description",
        content: "Filter by look, budget, rating and distance to find your artist.",
      },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const [query, setQuery] = useState("");
  const [look, setLook] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [showFilters, setShowFilters] = useState(true);
  const [artists, setArtists] = useState<Artist[]>([]);

  useEffect(() => {
    void fetch("/api/artists")
      .then((response) => response.json())
      .then((payload: { artists?: Array<Record<string, unknown>> }) => setArtists((payload.artists ?? []).map(toArtist)))
      .catch(() => setArtists([]));
  }, []);

  const results = artists
    .filter((a) => (look ? a.specialties.includes(look) : true))
    .filter((a) => a.startingPrice <= maxPrice)
    .filter((a) =>
      query
        ? `${a.name} ${a.area} ${a.specialties.join(" ")}`
            .toLowerCase()
            .includes(query.toLowerCase())
        : true,
    )
    .sort((a, b) => Number(b.premium) - Number(a.premium) || b.rating - a.rating);

  return (
    <AppShell
      title="Find an artist"
      subtitle={`${results.length} artists in Mumbai`}
      headerRight={
        <button
          onClick={() => setShowFilters((v) => !v)}
          aria-label="Toggle filters"
          className="grid size-10 place-items-center rounded-full border bg-card transition-colors hover:bg-accent"
        >
          <SlidersHorizontal className="size-4" />
        </button>
      }
    >
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search name, area or look"
        className="h-12 rounded-2xl bg-card"
      />

      {showFilters && (
        <div className="surface mt-3 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Look
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {serviceCategories.map((c) => (
              <button
                key={c}
                onClick={() => setLook((v) => (v === c ? null : c))}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  look === c ? "border-primary bg-primary text-primary-foreground" : "bg-card",
                )}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Max starting price</span>
            <span className="text-primary">{inr(maxPrice)}</span>
          </div>
          <Slider
            className="mt-3"
            value={[maxPrice]}
            min={2000}
            max={12000}
            step={500}
            onValueChange={([v]) => setMaxPrice(v ?? 10000)}
          />
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {results.map((a) => (
          <ArtistCard key={a.id} artist={a} showBoostLabel={true} />
        ))}
        {results.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No artists match these filters yet.
          </p>
        )}
      </div>
    </AppShell>
  );
}

function toArtist(source: Record<string, unknown>): Artist {
  const name = String(source["name"] ?? "Artist");
  return { id: String(source["id"]), name, tagline: String(source["tagline"] ?? "Independent beauty artist"), city: String(source["city"] ?? ""), area: String(source["area"] ?? ""), rating: 0, reviews: 0, startingPrice: Number(source["startingPrice"] ?? 0), distanceKm: 0, premium: Boolean(source["premium"]), verified: Boolean(source["verified"]), specialties: Array.isArray(source["specialties"]) ? source["specialties"].map(String) : [], initials: name.split(" ").map((part) => part[0] ?? "").join("").slice(0, 2), hue: 330 };
}
