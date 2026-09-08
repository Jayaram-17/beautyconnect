import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Check, CalendarDays, Crown, MessageCircle, Scissors, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { inr } from "@/lib/mock-data";

export const Route = createFileRoute("/pro/subscription")({
  head: () => ({
    meta: [
      { title: "Pro Plan | Glowlist Studio" },
      {
        name: "description",
        content:
          "Unlock Pro Studio management features: CallMeBot WhatsApp reminders, custom package editor, and full revenue analytics.",
      },
    ],
  }),
  component: SubscriptionPage,
});

const perks = [
  { icon: MessageCircle, label: "Automated WhatsApp Reminders", detail: "CallMeBot 24H & 2H automated WhatsApp alerts to your phone" },
  { icon: Scissors, label: "Package Price & Duration Controls", detail: "Edit price (₹) & duration (minutes) for all packages anytime" },
  { icon: BarChart3, label: "Studio Revenue & Financial Analytics", detail: "Monthly order charts, revenue trends, and financial reports" },
  { icon: CalendarDays, label: "Unlimited Outside Booking Log", detail: "Log & manage all your offline client appointments in one place" },
];

function SubscriptionPage() {
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);

  useEffect(() => {
    void fetch("/api/artists/me/subscription")
      .then((res) => (res.ok ? res.json() : { premium: false }))
      .then((data: { premium?: boolean }) => {
        setIsPremium(Boolean(data.premium));
      })
      .catch(() => setIsPremium(false))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (active: boolean) => {
    setUpdating(true);
    try {
      const res = await fetch("/api/artists/me/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      });
      if (!res.ok) throw new Error("Failed to update plan status");
      const data = (await res.json()) as { premium?: boolean };
      const nextState = Boolean(data.premium);
      setIsPremium(nextState);
      if (nextState) {
        toast.success("Pro Studio Plan activated! Full WhatsApp reminders & analytics unlocked.");
      } else {
        toast.info("Pro Plan set to standard.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update plan status.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <AppShell title="Studio Plan" subtitle={loading ? "Loading plan details..." : isPremium ? "Pro Studio Plan · Active" : "Standard Plan"}>
      <div className={isPremium ? "glam-gradient rounded-3xl p-5 text-primary-foreground" : "rounded-3xl border bg-card p-5 text-foreground"}>
        <Crown className="size-7 text-gold" />
        <h2 className="mt-3 font-display text-2xl font-semibold">{isPremium ? "Pro Studio Plan" : "Standard Plan"}</h2>
        <p className="mt-1 text-sm opacity-90">
          {isPremium ? `${inr(99)} / month · Auto-renews` : "Upgrade to unlock full WhatsApp reminders & financial analytics"}
        </p>
        {isPremium && (
          <div className="mt-4 h-1.5 rounded-full bg-background/25">
            <div className="h-full w-[100%] rounded-full bg-background/80" />
          </div>
        )}
      </div>

      <div className="surface mt-4 divide-y p-0">
        {perks.map((p) => (
          <div key={p.label} className="flex items-center gap-3 px-4 py-3.5">
            <span className="grid size-9 place-items-center rounded-full bg-accent text-accent-foreground">
              <p.icon className="size-4 text-primary" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{p.label}</p>
              <p className="text-xs text-muted-foreground">{p.detail}</p>
            </div>
            {isPremium ? (
              <Check className="size-4 text-success" />
            ) : (
              <span className="text-xs font-semibold text-muted-foreground">Pro</span>
            )}
          </div>
        ))}
      </div>

      {isPremium && (
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
      )}

      {!isPremium ? (
        <button
          disabled={updating}
          onClick={() => void handleToggle(true)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          <Sparkles className="size-4" />
          {updating ? "Activating..." : "Subscribe to Pro Studio Plan"}
        </button>
      ) : (
        <>
          <button
            disabled={updating}
            onClick={() => void handleToggle(true)}
            className="mt-4 w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {updating ? "Updating..." : "Renew early"}
          </button>
          <button
            disabled={updating}
            onClick={() => void handleToggle(false)}
            className="mt-2 w-full rounded-full border py-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-destructive disabled:opacity-60"
          >
            {updating ? "Updating..." : "Cancel subscription"}
          </button>
        </>
      )}
    </AppShell>
  );
}
