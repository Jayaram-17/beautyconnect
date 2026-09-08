import { createFileRoute } from "@tanstack/react-router";
import { Check, Edit2, Pencil, Plus, Sparkles, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Switch } from "@/components/ui/switch";
import { predefinedPackages, type PredefinedPackage } from "@/lib/predefined-packages";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pro/services")({ component: ArtistServices });

type Service = { id: string; name: string; durationMinutes: number; price: number; active: boolean };

const categories = ["All", "Bridal", "Party", "HD", "Airbrush"] as const;
type Category = (typeof categories)[number];

const inr = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

function ArtistServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editing state for predefined or custom package
  const [editingPackage, setEditingPackage] = useState<{
    pkgName: string;
    serviceId?: string | undefined;
    category?: string;
    included?: string;
    currentPrice: number;
    currentDuration: number;
    currentActive: boolean;
  } | null>(null);

  const loadServices = () => {
    void fetch("/api/artists/me/services")
      .then(async (response) => {
        const data = (await response.json()) as { services?: Service[]; error?: string };
        if (!response.ok) throw new Error(data.error);
        setServices(data.services ?? []);
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load services."))
      .finally(() => setLoading(false));
  };

  useEffect(loadServices, []);

  const togglePredefinedPackage = async (pkg: PredefinedPackage, currentlyActive: boolean) => {
    const nextActive = !currentlyActive;
    const existing = services.find((s) => s.name.toLowerCase() === pkg.name.toLowerCase());

    if (existing) {
      setServices((prev) => prev.map((s) => (s.id === existing.id ? { ...s, active: nextActive } : s)));
      try {
        const res = await fetch(`/api/artists/me/services/${existing.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ active: nextActive }),
        });
        const data = (await res.json()) as { service?: Service; error?: string };
        if (!res.ok || !data.service) throw new Error(data.error);
        toast.success(`${pkg.name} ${nextActive ? "enabled" : "disabled for clients"}`);
      } catch (err) {
        setServices((prev) => prev.map((s) => (s.id === existing.id ? { ...s, active: currentlyActive } : s)));
        toast.error(err instanceof Error ? err.message : "Could not update service.");
      }
    } else {
      try {
        const res = await fetch("/api/artists/me/services", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name: pkg.name, durationMinutes: pkg.durationMinutes, price: pkg.price }),
        });
        const data = (await res.json()) as { service?: Service; error?: string };
        if (!res.ok || !data.service) throw new Error(data.error);

        let createdService = data.service;
        if (!nextActive) {
          const patchRes = await fetch(`/api/artists/me/services/${createdService.id}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ active: false }),
          });
          const patchData = (await patchRes.json()) as { service?: Service };
          if (patchData.service) createdService = patchData.service;
        }

        setServices((prev) => [createdService, ...prev]);
        toast.success(`${pkg.name} ${nextActive ? "enabled" : "disabled for clients"}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not update service.");
      }
    }
  };

  const handleSavePackageEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingPackage) return;
    const form = new FormData(event.currentTarget);
    const newPrice = Number(form.get("price"));
    const newDuration = Number(form.get("durationMinutes"));

    if (isNaN(newPrice) || newPrice < 0 || isNaN(newDuration) || newDuration < 15) {
      toast.error("Please enter a valid price and duration.");
      return;
    }

    setSaving(true);
    try {
      if (editingPackage.serviceId) {
        const res = await fetch(`/api/artists/me/services/${editingPackage.serviceId}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ price: newPrice, durationMinutes: newDuration }),
        });
        const data = (await res.json()) as { service?: Service; error?: string };
        if (!res.ok || !data.service) throw new Error(data.error);
        setServices((prev) => prev.map((s) => (s.id === data.service!.id ? data.service! : s)));
      } else {
        const res = await fetch("/api/artists/me/services", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name: editingPackage.pkgName,
            durationMinutes: newDuration,
            price: newPrice,
          }),
        });
        const data = (await res.json()) as { service?: Service; error?: string };
        if (!res.ok || !data.service) throw new Error(data.error);
        setServices((prev) => [data.service!, ...prev]);
      }
      toast.success(`Updated ${editingPackage.pkgName} price & duration!`);
      setEditingPackage(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save edits.");
    } finally {
      setSaving(false);
    }
  };

  const toggleCustomService = async (service: Service, active: boolean) => {
    setServices((current) => current.map((item) => (item.id === service.id ? { ...item, active } : item)));
    try {
      const response = await fetch(`/api/artists/me/services/${service.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ active }),
      });
      const data = (await response.json()) as { service?: Service; error?: string };
      if (!response.ok || !data.service) throw new Error(data.error);
      setServices((current) => current.map((item) => (item.id === service.id ? data.service! : item)));
      toast.success(`${service.name} ${active ? "enabled" : "disabled for clients"}`);
    } catch (reason) {
      setServices((current) => current.map((item) => (item.id === service.id ? service : item)));
      toast.error(reason instanceof Error ? reason.message : "Could not update service.");
    }
  };

  const addCustomService = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    try {
      const response = await fetch("/api/artists/me/services", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          durationMinutes: Number(form.get("durationMinutes")),
          price: Number(form.get("price")),
        }),
      });
      const data = (await response.json()) as { service?: Service; error?: string };
      if (!response.ok || !data.service) throw new Error(data.error);
      setServices((current) => [data.service!, ...current]);
      setShowForm(false);
      toast.success("Custom service added");
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Could not add service.");
    } finally {
      setSaving(false);
    }
  };

  const filteredPredefined = predefinedPackages.filter(
    (pkg) => selectedCategory === "All" || pkg.category === selectedCategory,
  );

  const customServices = services.filter(
    (s) => !predefinedPackages.some((pkg) => pkg.name.toLowerCase() === s.name.toLowerCase()),
  );

  return (
    <AppShell title="My services" subtitle="Manage packages, prices & time visible to clients">
      <div className="surface p-4">
        <p className="text-sm font-semibold">Predefined Packages & Custom Services</p>
        <p className="mt-1 text-xs text-muted-foreground">
          You can edit package duration (time) and price (₹), and toggle services ON or OFF. Disabled packages are hidden from client view.
        </p>
      </div>

      <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
              selectedCategory === cat
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-card text-foreground hover:bg-accent",
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {error && <p className="surface mt-4 text-sm text-destructive">{error}</p>}
      {loading && <p className="surface mt-4 text-sm text-muted-foreground">Loading services…</p>}

      {!loading && (
        <section className="mt-4">
          <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Predefined Packages ({filteredPredefined.length})
          </h2>
          <div className="flex flex-col gap-3">
            {filteredPredefined.map((pkg) => {
              const matched = services.find((s) => s.name.toLowerCase() === pkg.name.toLowerCase());
              const isActive = matched ? matched.active : true;
              const displayPrice = matched ? matched.price : pkg.price;
              const displayDuration = matched ? matched.durationMinutes : pkg.durationMinutes;

              return (
                <div
                  key={pkg.id}
                  className={cn(
                    "surface flex items-center justify-between gap-3 p-4 transition-all",
                    !isActive && "opacity-60 bg-muted/30",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">{pkg.name}</p>
                      <span className="rounded-full bg-accent px-2 py-0.5 text-[0.65rem] font-bold text-primary">
                        {pkg.category}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{pkg.included}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <p className="text-xs font-semibold text-primary">
                        {inr(displayPrice)} · {displayDuration} minutes
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingPackage({
                            pkgName: pkg.name,
                            serviceId: matched?.id,
                            category: pkg.category,
                            included: pkg.included,
                            currentPrice: displayPrice,
                            currentDuration: displayDuration,
                            currentActive: isActive,
                          })
                        }
                        className="inline-flex items-center gap-1 rounded-md border border-primary/30 px-2 py-0.5 text-[0.65rem] font-bold text-primary transition-colors hover:bg-primary/10"
                      >
                        <Pencil className="size-3" /> Edit Time & Price
                      </button>
                    </div>
                  </div>
                  <Switch
                    checked={isActive}
                    onCheckedChange={() => void togglePredefinedPackage(pkg, isActive)}
                  />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {!loading && customServices.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Custom Services ({customServices.length})
          </h2>
          <div className="flex flex-col gap-3">
            {customServices.map((service) => (
              <div key={service.id} className="surface flex items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{service.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">
                      {service.durationMinutes} minutes · {inr(service.price)}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingPackage({
                          pkgName: service.name,
                          serviceId: service.id,
                          currentPrice: service.price,
                          currentDuration: service.durationMinutes,
                          currentActive: service.active,
                        })
                      }
                      className="inline-flex items-center gap-1 rounded-md border border-primary/30 px-2 py-0.5 text-[0.65rem] font-bold text-primary transition-colors hover:bg-primary/10"
                    >
                      <Pencil className="size-3" /> Edit
                    </button>
                  </div>
                </div>
                <Switch
                  checked={service.active}
                  onCheckedChange={(active) => void toggleCustomService(service, active)}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Edit Package Modal Sheet */}
      {editingPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/35 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSavePackageEdit}
            className="w-full max-w-md rounded-3xl bg-background p-5 shadow-lift"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-base">Edit Package: {editingPackage.pkgName}</h3>
                {editingPackage.category && (
                  <span className="text-xs text-muted-foreground">{editingPackage.category} Category</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setEditingPackage(null)}
                className="grid size-8 place-items-center rounded-full border"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Price (₹)
                </label>
                <input
                  required
                  name="price"
                  type="number"
                  min="0"
                  defaultValue={editingPackage.currentPrice}
                  className="h-11 w-full rounded-xl border px-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Duration (minutes)
                </label>
                <input
                  required
                  name="durationMinutes"
                  type="number"
                  min="15"
                  step="15"
                  defaultValue={editingPackage.currentDuration}
                  className="h-11 w-full rounded-xl border px-3 text-sm"
                />
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setEditingPackage(null)}
                className="h-11 flex-1 rounded-full border text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={saving}
                className="h-11 flex-1 rounded-full bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save Package"}
              </button>
            </div>
          </form>
        </div>
      )}

      {showForm ? (
        <form onSubmit={addCustomService} className="surface mt-6 space-y-3 p-4">
          <h3 className="text-sm font-semibold">Add Custom Service</h3>
          <input required name="name" placeholder="Service name" className="h-11 w-full rounded-xl border px-3 text-sm" />
          <div className="grid grid-cols-2 gap-2">
            <input
              required
              name="durationMinutes"
              type="number"
              min="15"
              step="15"
              placeholder="Duration (minutes)"
              className="h-11 min-w-0 rounded-xl border px-3 text-sm"
            />
            <input
              required
              name="price"
              type="number"
              min="0"
              placeholder="Price (₹)"
              className="h-11 min-w-0 rounded-xl border px-3 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="h-10 flex-1 rounded-full border text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              disabled={saving}
              className="h-10 flex-1 rounded-full bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {saving ? "Saving…" : "Add service"}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed py-3.5 text-sm font-semibold text-primary hover:bg-accent/40"
        >
          <Plus className="size-4" /> Add custom service
        </button>
      )}
    </AppShell>
  );
}
