import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BadgeCheck, MapPin, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ArtistAvatar } from "@/components/glam-ui";
import { inr } from "@/lib/mock-data";

export const Route = createFileRoute("/artists/$artistId")({ component: ArtistServicesPage });

type ArtistDetails = { artist: { id: string; name: string; city: string | null; area: string | null; tagline: string; verified: boolean; premium: boolean; startingPrice: number }; services: Array<{ id: string; name: string; durationMinutes: number; price: number }> };

function ArtistServicesPage() {
  const { artistId } = Route.useParams();
  const [data, setData] = useState<ArtistDetails | null>(null);
  useEffect(() => { void fetch(`/api/artists/${artistId}`).then((response) => response.ok ? response.json() : null).then(setData).catch(() => setData(null)); }, [artistId]);

  if (!data) return <AppShell title="Artist" subtitle="Loading artist details"><p className="py-16 text-center text-sm text-muted-foreground">This artist is unavailable or has not completed their public profile.</p></AppShell>;
  const { artist, services } = data;
  const initials = artist.name.split(" ").map((part) => part[0]).join("").slice(0, 2);
  return <AppShell title={artist.name} subtitle={[artist.area, artist.city].filter(Boolean).join(", ") || "Beauty artist"}>
    <Link to="/search" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground"><ArrowLeft className="size-4" /> Back to search</Link>
    <section className="surface flex gap-4 p-4"><ArtistAvatar initials={initials} hue={330} className="size-16" /><div className="min-w-0 flex-1"><div className="flex items-center gap-1.5"><h2 className="truncate text-lg font-semibold">{artist.name}</h2>{artist.verified && <BadgeCheck className="size-4 text-success" />}</div><p className="mt-1 text-sm text-muted-foreground">{artist.tagline}</p><p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3.5" />{artist.area || artist.city || "Location not added"}</p></div></section>
    <h3 className="mb-3 mt-6 text-lg font-semibold">Services offered</h3>
    {services.length ? <div className="surface divide-y p-0">{services.map((service) => <div key={service.id} className="flex items-center justify-between gap-3 px-4 py-3.5"><div><p className="text-sm font-semibold">{service.name}</p><p className="text-xs text-muted-foreground">{service.durationMinutes} minutes</p></div><span className="text-sm font-semibold text-primary">{inr(service.price)}</span></div>)}</div> : <div className="surface p-5 text-center text-sm text-muted-foreground">This artist has not published services yet.</div>}
    {services.length > 0 && <Link to="/booking/new" search={{ artistId: artist.id }} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground"><Sparkles className="size-4" /> Book a service</Link>}
  </AppShell>;
}
