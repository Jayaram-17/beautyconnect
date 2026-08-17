import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Check, Crown, Phone, Rocket, Star } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { inr } from "@/lib/mock-data";

export const Route = createFileRoute("/pro/subscription")({
  head: () => ({
    meta: [
      { title: "Premium Plan | Glowlist Studio" },
      {
        name: "description",
        content:
          "Compare the free and premium artist plans: search boost, direct calls, analytics and featured placement.",
      },
      { property: "og:title", content: "Premium Plan | Glowlist Studio" },
      {
        property: "og:description",
        content: "Search boost, direct calls, analytics and featured placement.",
      },
    ],
  }),
  component: SubscriptionPage,
});

const perks = [
  { icon: Rocket, label: "Search ranking boost", detail: "Appear above free artists" },
  { icon: Phone, label: "Phone & WhatsApp button", detail: "Clients can reach you directly" },
  { icon: Star, label: "Featured placement", detail: "Home page spotlight rotation" },
  { icon: BarChart3, label: "Advanced analytics", detail: "Views, conversion, repeat clients" },
];

function SubscriptionPage() {
  return (
    <AppShell title="Your plan" subtitle="Premium · renews 12 Sep 2026">
      <div className="glam-gradient rounded-3xl p-5 text-primary-foreground">
        <Crown className="size-7" />
        <h2 className="mt-3 font-display text-2xl font-semibold">Premium</h2>
        <p className="mt-1 text-sm opacity-90">
          {inr(99)} / month · 24 days remaining
        </p>
        <div className="mt-4 h-1.5 rounded-full bg-background/25">
          <div className="h-full w-[80%] rounded-full bg-background/80" />
        </div>
      </div>

      <div className="surface mt-4 divide-y p-0">
        {perks.map((p) => (
          <div key={p.label} className="flex items-center gap-3 px-4 py-3.5">
            <span className="grid size-9 place-items-center rounded-full bg-accent text-accent-foreground">
              <p.icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{p.label}</p>
              <p className="text-xs text-muted-foreground">{p.detail}</p>
            </div>
            <Check className="size-4 text-success" />
          </div>
        ))}
      </div>

      <div className="surface mt-4 p-4">
        <h3 className="text-sm font-semibold">Billing history</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {["12 Aug 2026", "12 Jul 2026", "12 Jun 2026"].map((d) => (
            <li key={d} className="flex justify-between">
              <span className="text-muted-foreground">{d}</span>
              <span className="font-medium">{inr(99)}</span>
            </li>
          ))}
        </ul>
      </div>

      <button className="mt-4 w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground">
        Renew early
      </button>
      <button className="mt-2 w-full rounded-full border py-3 text-sm font-semibold text-muted-foreground">
        Cancel subscription
      </button>
    </AppShell>
  );
}
