import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-makeup.jpg";
import { AppShell } from "@/components/app-shell";
import { ArtistCard, SectionTitle } from "@/components/glam-ui";
import { artists, serviceCategories } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Glowlist — Book Trusted Makeup Artists Near You" },
      {
        name: "description",
        content:
          "Discover verified makeup artists for bridal, party and editorial looks. Compare prices, check availability and book in minutes.",
      },
      { property: "og:title", content: "Glowlist — Book Trusted Makeup Artists Near You" },
      {
        property: "og:description",
        content:
          "Discover verified makeup artists for bridal, party and editorial looks. Book in minutes.",
      },
    ],
  }),
  component: CustomerHome,
});

function CustomerHome() {
  const featured = artists.filter((a) => a.premium);

  return (
    <AppShell title="Hi, Ishita" subtitle="Ready for your next glow-up?">
      <Link
        to="/search"
        className="flex items-center gap-2 rounded-2xl border bg-card px-4 py-3 text-sm text-muted-foreground shadow-soft"
      >
        <Search className="size-4" />
        Search artists, services, areas
      </Link>

      <div className="relative mt-4 overflow-hidden rounded-3xl">
        <img
          src={heroImage}
          alt="Makeup artist applying bridal makeup with a brush"
          width={1024}
          height={640}
          className="h-44 w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-foreground/80 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 text-background">
          <p className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-widest">
            <Sparkles className="size-3.5" /> Wedding season
          </p>
          <h2 className="mt-1 font-display text-xl font-semibold">
            Bridal artists booking fast
          </h2>
        </div>
      </div>

      <SectionTitle>Browse by look</SectionTitle>
      <div className="hide-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
        {serviceCategories.map((c) => (
          <Link
            key={c}
            to="/search"
            className="shrink-0 rounded-full border bg-card px-4 py-2 text-sm font-medium shadow-soft"
          >
            {c}
          </Link>
        ))}
      </div>

      <SectionTitle action="See all">Featured near you</SectionTitle>
      <div className="flex flex-col gap-3">
        {featured.map((a) => (
          <ArtistCard key={a.id} artist={a} />
        ))}
      </div>

      <SectionTitle>Top rated</SectionTitle>
      <div className="flex flex-col gap-3">
        {[...artists]
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 3)
          .map((a) => (
            <ArtistCard key={a.id} artist={a} />
          ))}
      </div>
    </AppShell>
  );
}
