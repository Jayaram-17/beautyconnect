import { createFileRoute } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ArtistCard } from "@/components/glam-ui";
import { artists } from "@/lib/mock-data";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "Saved Artists | Glowlist" },
      {
        name: "description",
        content: "Your shortlist of favourite makeup artists, saved for the next celebration.",
      },
      { property: "og:title", content: "Saved Artists | Glowlist" },
      {
        property: "og:description",
        content: "Your shortlist of favourite makeup artists.",
      },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const saved = artists.filter((a) => ["a1", "a3", "a5"].includes(a.id));

  return (
    <AppShell title="Saved artists" subtitle={`${saved.length} in your shortlist`}>
      <div className="flex flex-col gap-3">
        {saved.map((a) => (
          <ArtistCard key={a.id} artist={a} />
        ))}
      </div>
      <div className="mt-8 flex flex-col items-center gap-2 rounded-3xl border border-dashed p-6 text-center">
        <Heart className="size-6 text-primary" />
        <p className="text-sm text-muted-foreground">
          Tap the heart on any artist profile to keep them handy for your next event.
        </p>
      </div>
    </AppShell>
  );
}
