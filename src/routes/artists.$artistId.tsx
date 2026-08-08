import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BadgeCheck, Crown, Heart, MapPin, Phone, Star } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ArtistAvatar } from "@/components/glam-ui";
import { artistPackages, artists, artistServices, daySlots, inr } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/artists/$artistId")({
  head: () => ({
    meta: [
      { title: "Artist Profile | Glowlist" },
      {
        name: "description",
        content:
          "View an artist's portfolio, services, packages, reviews and open time slots, then book instantly.",
      },
      { property: "og:title", content: "Artist Profile | Glowlist" },
      {
        property: "og:description",
        content: "Portfolio, services, packages, reviews and open time slots.",
      },
    ],
  }),
  component: ArtistProfile,
});

const reviews = [
  {
    id: "r1",
    name: "Aditi N.",
    rating: 5,
    text: "Flawless bridal look that lasted 14 hours. She arrived early and was so calm.",
  },
  {
    id: "r2",
    name: "Sara K.",
    rating: 5,
    text: "Listened to exactly what I wanted. My photos came out unreal.",
  },
  {
    id: "r3",
    name: "Priya M.",
    rating: 4,
    text: "Beautiful work, slightly delayed start but worth the wait.",
  },
];

function ArtistProfile() {
  const { artistId } = Route.useParams();
  const artist = artists.find((a) => a.id === artistId) ?? artists[0]!;

  return (
    <AppShell title={artist.name} subtitle={`${artist.area}, ${artist.city}`}>
      <Link
        to="/search"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground"
      >
        <ArrowLeft className="size-4" /> Back to search
      </Link>

      <div className="surface p-4">
        <div className="flex items-start gap-4">
          <ArtistAvatar initials={artist.initials} hue={artist.hue} className="size-16" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h2 className="truncate text-lg font-semibold">{artist.name}</h2>
              {artist.verified && <BadgeCheck className="size-4 text-success" />}
              {artist.premium && <Crown className="size-4 text-gold" />}
            </div>
            <p className="text-xs text-muted-foreground">{artist.tagline}</p>
            <div className="mt-2 flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 font-semibold">
                <Star className="size-3.5 fill-gold text-gold" /> {artist.rating} (
                {artist.reviews})
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="size-3.5" /> {artist.distanceKm} km away
              </span>
            </div>
          </div>
          <button
            aria-label="Save artist"
            className="grid size-9 place-items-center rounded-full border"
          >
            <Heart className="size-4 text-primary" />
          </button>
        </div>
        {artist.premium && (
          <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground">
            <Phone className="size-4" /> +91 98••• ••342
          </button>
        )}
      </div>

      <h3 className="mb-3 mt-6 text-lg font-semibold">Portfolio</h3>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-xl"
            style={{
              backgroundImage: `linear-gradient(${140 + i * 20}deg, oklch(0.7 0.12 ${(artist.hue + i * 28) % 360}), oklch(0.88 0.06 ${(artist.hue + i * 60) % 360}))`,
            }}
          />
        ))}
      </div>

      <h3 className="mb-3 mt-6 text-lg font-semibold">Services</h3>
      <div className="surface divide-y p-0">
        {artistServices
          .filter((s) => s.active)
          .map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm font-medium">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.duration}</p>
              </div>
              <span className="text-sm font-semibold text-primary">{inr(s.price)}</span>
            </div>
          ))}
      </div>

      <h3 className="mb-3 mt-6 text-lg font-semibold">Packages</h3>
      <div className="flex flex-col gap-3">
        {artistPackages.map((p) => (
          <div key={p.id} className="surface p-4">
            <div className="flex items-baseline justify-between">
              <h4 className="font-semibold">{p.name}</h4>
              <span className="font-semibold text-primary">{inr(p.price)}</span>
            </div>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              {p.includes.map((i) => (
                <li key={i}>• {i}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <h3 className="mb-3 mt-6 text-lg font-semibold">Availability today</h3>
      <div className="flex flex-wrap gap-2">
        {daySlots.map((s) => (
          <span
            key={s.time}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium",
              s.state === "available" && "border-success/40 bg-success/10 text-success",
              s.state === "booked" && "bg-muted text-muted-foreground line-through",
              s.state === "blocked" && "bg-muted text-muted-foreground",
            )}
          >
            {s.time}
          </span>
        ))}
      </div>

      <h3 className="mb-3 mt-6 text-lg font-semibold">Reviews</h3>
      <div className="flex flex-col gap-3">
        {reviews.map((r) => (
          <div key={r.id} className="surface p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{r.name}</p>
              <span className="flex items-center gap-0.5">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="size-3 fill-gold text-gold" />
                ))}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">{r.text}</p>
          </div>
        ))}
      </div>

      <div className="sticky bottom-2 mt-6">
        <Link
          to="/booking/new"
          search={{ artistId: artist.id }}
          className="flex w-full items-center justify-center rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-lift"
        >
          Book from {inr(artist.startingPrice)}
        </Link>
      </div>
    </AppShell>
  );
}
