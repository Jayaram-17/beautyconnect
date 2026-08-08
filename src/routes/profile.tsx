import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  ChevronRight,
  CreditCard,
  HelpCircle,
  LogOut,
  MapPin,
  Star,
  UserRound,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ArtistAvatar } from "@/components/glam-ui";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile | Glowlist" },
      {
        name: "description",
        content: "Manage your details, saved addresses, payment methods and notifications.",
      },
      { property: "og:title", content: "My Profile | Glowlist" },
      {
        property: "og:description",
        content: "Manage details, addresses, payments and notifications.",
      },
    ],
  }),
  component: ProfilePage,
});

const rows = [
  { label: "Edit profile", icon: UserRound },
  { label: "Saved addresses", icon: MapPin },
  { label: "Payment methods", icon: CreditCard },
  { label: "My reviews", icon: Star },
  { label: "Notifications", icon: Bell },
  { label: "Help & support", icon: HelpCircle },
];

function ProfilePage() {
  return (
    <AppShell title="Profile" subtitle="Account and preferences">
      <div className="surface flex items-center gap-4 p-4">
        <ArtistAvatar initials="IV" hue={340} />
        <div className="min-w-0">
          <h2 className="text-base font-semibold">Ishita Verma</h2>
          <p className="text-xs text-muted-foreground">+91 98••• ••210</p>
          <p className="text-xs text-muted-foreground">Bandra West, Mumbai</p>
        </div>
      </div>

      <div className="surface mt-3 divide-y overflow-hidden p-0">
        {rows.map((r) => (
          <button
            key={r.label}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm font-medium transition-colors hover:bg-accent/50"
          >
            <r.icon className="size-4 text-primary" />
            <span className="flex-1">{r.label}</span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </button>
        ))}
      </div>

      <Link
        to="/pro"
        className="surface mt-3 flex items-center gap-3 p-4 text-sm font-semibold"
      >
        <span className="flex-1">Switch to artist studio</span>
        <ChevronRight className="size-4 text-muted-foreground" />
      </Link>

      <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border py-3 text-sm font-semibold text-destructive">
        <LogOut className="size-4" /> Log out
      </button>
    </AppShell>
  );
}
