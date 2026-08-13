import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  CalendarDays,
  Crown,
  Heart,
  Home,
  LayoutGrid,
  Receipt,
  Search,
  Scissors,
  ShieldCheck,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { CityInput } from "@/components/city-input";
import { ThemeToggle } from "@/components/theme-toggle";

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

const adminTabs: Tab[] = [
  { to: "/admin", label: "Overview", icon: ShieldCheck, exact: true },
  { to: "/admin/transactions", label: "Financials", icon: Receipt },
  { to: "/admin/bookings", label: "Bookings", icon: CalendarDays },
  { to: "/admin/artists", label: "Artists", icon: Users },
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
  const { user, loading, updateProfile } = useAuth();
  const isArtist = user?.role === "ARTIST";
  const isAdmin = pathname.startsWith("/admin");
  const tabs = isAdmin ? adminTabs : isArtist ? artistTabs : customerTabs;

  useEffect(() => {
    if (!loading && !user) window.location.assign("/auth");
    if (!loading && user?.role !== "ARTIST" && (pathname === "/pro" || pathname.startsWith("/pro/"))) {
      window.location.assign("/");
    }
  }, [loading, pathname, user]);

  if (loading || !user) {
    return <div className="grid min-h-screen place-items-center bg-secondary text-sm text-muted-foreground">Loading your account…</div>;
  }

  return (
    <div className="min-h-screen w-full bg-secondary/60 md:py-8">
      <div className="mx-auto flex w-full max-w-[430px] flex-col bg-background shadow-lift md:min-h-[860px] md:rounded-[2.25rem] md:border md:overflow-hidden">
        {!bare && (
          <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b bg-background/90 px-5 pt-6 pb-4 backdrop-blur">
            <div className="min-w-0">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-primary">
                {isAdmin ? "Super Admin" : isArtist ? "Artist studio" : "Glowlist"}
              </p>
              <h1 className="truncate text-2xl font-semibold">{title}</h1>
              {subtitle && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {headerRight}
              <ThemeToggle />
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
              if (tab.to === "/profile") {
                return (
                  <a
                    key={tab.to}
                    href="/profile"
                    className={cn(
                      "flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[0.65rem] font-medium transition-colors",
                      active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <span className={cn("grid size-9 place-items-center rounded-xl transition-colors", active && "bg-accent")}>
                      <tab.icon className="size-[1.15rem]" />
                    </span>
                    {tab.label}
                  </a>
                );
              }
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
        </nav>
        {!user.city && <ProfileCompletion onSave={updateProfile} />}
      </div>
    </div>
  );
}

function ProfileCompletion({ onSave }: { onSave: ReturnType<typeof useAuth>["updateProfile"] }) {
  const [city, setCity] = useState("");
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const detect = () => {
    if (!navigator.geolocation) return toast.error("Location detection is not supported in this browser.");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}`);
        const payload = await response.json() as { address?: Record<string, string> };
        const address = payload.address ?? {};
        const detected = address.city || address.town || address.village || address.county || address.state;
        if (!detected) throw new Error();
        setCity(detected);
      } catch { toast.error("Could not determine your city. Please enter it manually."); }
      finally { setLocating(false); }
    }, () => { setLocating(false); toast.error("Location permission was not granted."); }, { timeout: 10000 });
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true);
    try { await onSave({ city }); toast.success("Profile completed"); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Could not save your details."); }
    finally { setSaving(false); }
  };
  return <div className="absolute inset-0 z-30 grid place-items-center bg-foreground/35 p-5 backdrop-blur-sm"><form onSubmit={submit} className="w-full rounded-3xl bg-background p-5 shadow-lift"><h2 className="text-lg font-semibold">Complete your profile</h2><p className="mt-1 text-sm text-muted-foreground">Add your location to continue.</p><label className="mt-5 block text-xs font-bold">City<div className="mt-1.5 flex gap-2"><CityInput required value={city} onChange={setCity} placeholder="Start typing your city" className="h-11 min-w-0 flex-1 rounded-xl border px-3 text-sm outline-none ring-primary focus:ring-2" /><button type="button" onClick={detect} disabled={locating} className="rounded-xl border px-3 text-xs font-bold text-primary disabled:opacity-60">{locating ? "Finding…" : "Detect"}</button></div></label><button disabled={saving} className="mt-5 h-11 w-full rounded-full bg-primary text-sm font-bold text-primary-foreground disabled:opacity-60">{saving ? "Saving…" : "Save and continue"}</button></form></div>;
}
