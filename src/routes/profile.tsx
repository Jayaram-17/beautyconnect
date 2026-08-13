import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, LogOut, MapPin, Settings, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ArtistAvatar } from "@/components/glam-ui";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/profile")({ component: ProfilePage });

function ProfilePage() {
  const { user, signOut } = useAuth();
  const initials = (user?.name ?? "Glowlist User").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return (
    <AppShell title="Profile" subtitle="Account and preferences">
      <div className="surface flex items-center gap-4 p-4">
        <ArtistAvatar initials={initials} hue={340} />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-semibold">{user?.name}</h2>
          <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3" />{user?.city || "Add your city"}</p>
        </div>
        <span className="rounded-full bg-accent px-2.5 py-1 text-[0.65rem] font-bold text-primary">{user?.role === "ARTIST" ? "ARTIST" : "CLIENT"}</span>
      </div>

      <div className="surface mt-3 overflow-hidden p-0">
        <ProfileLink icon={Settings} title="Account settings" detail="Name, phone and location" />
        <ProfileLink icon={ShieldCheck} title="Notifications & privacy" detail="Booking and email preferences" />
      </div>

      <p className="mt-5 px-1 text-xs leading-5 text-muted-foreground">Your email is used to sign in and cannot be changed here. Your settings are securely saved to your account.</p>
      <button onClick={() => void signOut().then(() => window.location.assign("/auth"))} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border py-3 text-sm font-semibold text-destructive"><LogOut className="size-4" /> Log out</button>
    </AppShell>
  );
}

function ProfileLink({ icon: Icon, title, detail }: { icon: typeof Settings; title: string; detail: string }) {
  return <Link to="/settings" className="flex items-center gap-3 border-b px-4 py-3.5 last:border-0 hover:bg-accent/50"><Icon className="size-4 text-primary" /><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{title}</span><span className="block text-xs text-muted-foreground">{detail}</span></span><ChevronRight className="size-4 text-muted-foreground" /></Link>;
}
