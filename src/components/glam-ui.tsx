import { Link } from "@tanstack/react-router";
import { BadgeCheck, Crown, MapPin, Star } from "lucide-react";
import type { Artist, BookingStatus } from "@/lib/mock-data";
import { inr } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function ArtistAvatar({
  initials,
  hue,
  className,
}: {
  initials: string;
  hue: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-2xl font-display text-lg font-semibold text-primary-foreground",
        className ?? "size-14",
      )}
      style={{
        backgroundImage: `linear-gradient(140deg, oklch(0.58 0.15 ${hue}), oklch(0.72 0.12 ${(hue + 45) % 360}))`,
      }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

export function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <Link
      to="/artists/$artistId"
      params={{ artistId: artist.id }}
      className="surface flex gap-4 p-4 transition-transform active:scale-[0.99]"
    >
      <ArtistAvatar initials={artist.initials} hue={artist.hue} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h3 className="truncate text-base font-semibold">{artist.name}</h3>
          {artist.verified && <BadgeCheck className="size-4 shrink-0 text-success" />}
          {artist.premium && <Crown className="size-4 shrink-0 text-gold" />}
        </div>
        <p className="truncate text-xs text-muted-foreground">{artist.tagline}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className="flex items-center gap-1 font-semibold">
            <Star className="size-3.5 fill-gold text-gold" />
            {artist.rating}
            <span className="font-normal text-muted-foreground">({artist.reviews})</span>
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="size-3.5" />
            {artist.area} · {artist.distanceKm} km
          </span>
        </div>
        <p className="mt-2 text-sm font-semibold text-primary">
          from {inr(artist.startingPrice)}
        </p>
      </div>
    </Link>
  );
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-warning/20 text-warning-foreground",
  ACCEPTED: "bg-accent text-accent-foreground",
  CONFIRMED: "bg-success/15 text-success",
  COMPLETED: "bg-muted text-muted-foreground",
  CANCELLED: "bg-destructive/12 text-destructive",
  REJECTED: "bg-destructive/12 text-destructive",
  HELD_IN_ESCROW: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
  REFUNDED: "bg-destructive/12 text-destructive",
  PROCESSING: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider",
        statusStyles[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      {status.replace(/_/g, " ").toLowerCase()}
    </span>
  );
}

export function SectionTitle({ children, action }: { children: string; action?: string }) {
  return (
    <div className="mb-3 mt-6 flex items-baseline justify-between">
      <h2 className="text-lg font-semibold">{children}</h2>
      {action && <span className="text-xs font-medium text-primary">{action}</span>}
    </div>
  );
}
