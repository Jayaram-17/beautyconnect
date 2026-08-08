import { createFileRoute } from "@tanstack/react-router";
import { ImagePlus, Plus } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Switch } from "@/components/ui/switch";
import { artistPackages, artistServices, inr } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pro/services")({
  head: () => ({
    meta: [
      { title: "Services & Portfolio | Glowlist Studio" },
      {
        name: "description",
        content:
          "Manage your service menu, pricing, packages and portfolio gallery from one screen.",
      },
      { property: "og:title", content: "Services & Portfolio | Glowlist Studio" },
      {
        property: "og:description",
        content: "Manage your service menu, pricing, packages and gallery.",
      },
    ],
  }),
  component: ArtistServices,
});

function ArtistServices() {
  const [services, setServices] = useState(artistServices);
  const [tab, setTab] = useState<"Services" | "Packages" | "Gallery">("Services");

  return (
    <AppShell title="My offering" subtitle="Services, packages and portfolio">
      <div className="flex gap-1 rounded-2xl bg-muted p-1">
        {(["Services", "Packages", "Gallery"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 rounded-xl py-2 text-sm font-semibold transition-colors",
              tab === t ? "bg-card shadow-soft" : "text-muted-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Services" && (
        <div className="mt-4 flex flex-col gap-3">
          {services.map((s) => (
            <div key={s.id} className="surface flex items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{s.name}</p>
                <p className="text-xs text-muted-foreground">
                  {s.duration} · {inr(s.price)}
                </p>
              </div>
              <Switch
                checked={s.active}
                onCheckedChange={(v) =>
                  setServices((prev) =>
                    prev.map((x) => (x.id === s.id ? { ...x, active: v } : x)),
                  )
                }
              />
            </div>
          ))}
          <button className="flex items-center justify-center gap-2 rounded-2xl border border-dashed py-3.5 text-sm font-semibold text-primary">
            <Plus className="size-4" /> Add service
          </button>
        </div>
      )}

      {tab === "Packages" && (
        <div className="mt-4 flex flex-col gap-3">
          {artistPackages.map((p) => (
            <div key={p.id} className="surface p-4">
              <div className="flex items-baseline justify-between">
                <h3 className="font-semibold">{p.name}</h3>
                <span className="font-semibold text-primary">{inr(p.price)}</span>
              </div>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                {p.includes.map((i) => (
                  <li key={i}>• {i}</li>
                ))}
              </ul>
            </div>
          ))}
          <button className="flex items-center justify-center gap-2 rounded-2xl border border-dashed py-3.5 text-sm font-semibold text-primary">
            <Plus className="size-4" /> Create package
          </button>
        </div>
      )}

      {tab === "Gallery" && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-xl"
              style={{
                backgroundImage: `linear-gradient(${120 + i * 25}deg, oklch(0.7 0.12 ${(20 + i * 34) % 360}), oklch(0.88 0.06 ${(70 + i * 40) % 360}))`,
              }}
            />
          ))}
          <button className="grid aspect-square place-items-center rounded-xl border border-dashed text-primary">
            <ImagePlus className="size-5" />
          </button>
        </div>
      )}
    </AppShell>
  );
}
