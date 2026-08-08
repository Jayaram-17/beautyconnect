import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  CalendarDays,
  Crown,
  Heart,
  Home,
  LayoutGrid,
  Search,
  Scissors,
  Sparkles,
  User,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tab = { to: string; label: string; icon: LucideIcon; exact?: boolean };

const customerTabs: Tab[] = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/search", label: "Search", icon: Search },
  { to: "/bookings", label: "Bookings", icon: CalendarDays },
  { to: "/favorites", label: "Saved", icon: Heart },
  { to: "/profile", label: "Profile", icon: User },
];

const artistTabs: Tab[] = [
  { to: "/pro", label: "Dashboard", icon: LayoutGrid, exact: true },
  { to: "/pro/bookings", label: "Requests", icon: CalendarDays },
  { to: "/pro/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/pro/services", label: "Services", icon: Scissors },
  { to: "/pro/subscription", label: "Plan", icon: Crown },
];

export function AppShell({
  title,
  subtitle,
  children,
  headerRight,
  bare,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  headerRight?: ReactNode;
  bare?: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isArtist = pathname.startsWith("/pro");
  const tabs = isArtist ? artistTabs : customerTabs;

  return (
    <div className="min-h-screen w-full bg-secondary/60 md:py-8">
      <div className="mx-auto flex w-full max-w-[430px] flex-col bg-background shadow-lift md:min-h-[860px] md:rounded-[2.25rem] md:border md:overflow-hidden">
        {!bare && (
          <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b bg-background/90 px-5 pt-6 pb-4 backdrop-blur">
            <div className="min-w-0">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-primary">
                {isArtist ? "Artist studio" : "Glowlist"}
              </p>
              <h1 className="truncate text-2xl font-semibold">{title}</h1>
              {subtitle && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {headerRight}
              <Link
                to="/notifications"
                aria-label="Notifications"
                className="relative grid size-10 place-items-center rounded-full border bg-card text-foreground transition-colors hover:bg-accent"
              >
                <Bell className="size-4" />
                <span className="absolute right-2 top-2 size-2 rounded-full bg-primary" />
              </Link>
            </div>
          </header>
        )}

        <main className="flex-1 px-5 pb-28 pt-4">{children}</main>

        <nav className="sticky bottom-0 z-20 border-t bg-background/95 px-2 pb-3 pt-2 backdrop-blur">
          <div className="flex items-center justify-between">
            {tabs.map((tab) => {
              const active = tab.exact
                ? pathname === tab.to
                : pathname === tab.to || pathname.startsWith(`${tab.to}/`);
              return (
                <Link
                  key={tab.to}
                  to={tab.to}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[0.65rem] font-medium transition-colors",
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-9 place-items-center rounded-xl transition-colors",
                      active && "bg-accent",
                    )}
                  >
                    <tab.icon className="size-[1.15rem]" />
                  </span>
                  {tab.label}
                </Link>
              );
            })}
          </div>
          <RoleSwitch isArtist={isArtist} />
        </nav>
      </div>
    </div>
  );
}

function RoleSwitch({ isArtist }: { isArtist: boolean }) {
  return (
    <div className="mt-2 flex items-center justify-center">
      <div className="flex items-center gap-1 rounded-full border bg-muted p-1 text-[0.7rem] font-semibold">
        <Link
          to="/"
          className={cn(
            "flex items-center gap-1 rounded-full px-3 py-1 transition-colors",
            !isArtist ? "bg-primary text-primary-foreground" : "text-muted-foreground",
          )}
        >
          <Sparkles className="size-3" /> Customer
        </Link>
        <Link
          to="/pro"
          className={cn(
            "flex items-center gap-1 rounded-full px-3 py-1 transition-colors",
            isArtist ? "bg-primary text-primary-foreground" : "text-muted-foreground",
          )}
        >
          <Crown className="size-3" /> Artist
        </Link>
      </div>
    </div>
  );
}
