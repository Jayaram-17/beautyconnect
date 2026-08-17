import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { AppShell } from "@/components/app-shell";
import { cn } from "@/lib/utils";
import { predefinedPackages, type PredefinedPackage } from "@/lib/predefined-packages";

export const Route = createFileRoute("/booking/new")({ validateSearch: z.object({ artistId: z.string().optional() }), component: NewBooking });

type ArtistDetails = { artist: { id: string; name: string; city: string | null; area: string | null }; services: Array<{ id: string; name: string; durationMinutes: number; price: number }> };
const steps = ["Services", "Date & time", "Details", "Pay"];
const inr = (amount: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

function NewBooking() {
  const { artistId } = Route.useSearch();
  const [data, setData] = useState<ArtistDetails | null>(null);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [packageCategory, setPackageCategory] = useState<"All" | PredefinedPackage["category"]>("All");
  const [selectedPackage, setSelectedPackage] = useState<PredefinedPackage | null>(null);
  const [slot, setSlot] = useState("10:00");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const defaultAppointmentDate = useMemo(() => { const date = new Date(); date.setDate(date.getDate() + 1); return date.toISOString().slice(0, 10); }, []);
  const [appointmentDate, setAppointmentDate] = useState(defaultAppointmentDate);

  useEffect(() => {
    if (!artistId) { setError("Choose an artist before starting a booking."); return; }
    void fetch(`/api/artists/${artistId}`).then(async (response) => {
      const payload = await response.json() as ArtistDetails & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Could not load this artist.");
      setData(payload); setSelected(payload.services[0] ? [payload.services[0].id] : []);
    }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load this artist."));
  }, [artistId]);

  const total = selectedPackage?.price ?? data?.services.filter((service) => selected.includes(service.id)).reduce((sum, service) => sum + service.price, 0) ?? 0;
  const advance = Math.round(total * 0.2);
  const serviceName = selectedPackage?.name ?? data?.services.filter((service) => selected.includes(service.id)).map((service) => service.name).join(", ") ?? "";
  const continueBooking = () => { if (step === 0 && !selected.length && !selectedPackage) return setError("Select a package or at least one service."); if (step === 1 && (!appointmentDate || !slot)) return setError("Choose an appointment date and time."); if (step === 2 && !location.trim()) return setError("Enter the event location."); setError(""); setStep((current) => current + 1); };
  const submit = async () => {
    if (!data) return;
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/bookings", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ artistId: data.artist.id, serviceName, date: appointmentDate, time: slot, location: location.trim(), notes: notes.trim() || undefined, total }) });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Could not create your booking.");
      window.location.assign("/bookings");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not create your booking."); } finally { setSaving(false); }
  };

  if (!data) return <AppShell title="New booking" subtitle="Choose an artist"><p className="surface text-sm text-muted-foreground">{error || "Loading artist details…"}</p></AppShell>;
  const { artist, services } = data;
  return <AppShell title="New booking" subtitle={`with ${artist.name}`}>
    <Link to="/artists/$artistId" params={{ artistId: artist.id }} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground"><ArrowLeft className="size-4" /> Artist profile</Link>
    <ol className="flex items-center gap-1">{steps.map((label, index) => <li key={label} className="flex-1"><div className={cn("h-1.5 rounded-full", index <= step ? "bg-primary" : "bg-muted")} /><p className={cn("mt-1.5 text-[0.65rem] font-medium", index === step ? "text-primary" : "text-muted-foreground")}>{label}</p></li>)}</ol>
    <div className="mt-5">
      {step === 0 && <div><p className="mb-2 text-sm font-semibold">Predefined packages</p><div className="mb-3 flex flex-wrap gap-2">{(["All", "Bridal", "Party", "HD", "Airbrush"] as const).map((category) => <button key={category} onClick={() => setPackageCategory(category)} className={cn("rounded-full border px-3 py-1.5 text-xs font-semibold", packageCategory === category && "border-primary bg-primary text-primary-foreground")}>{category}</button>)}</div><div className="flex flex-col gap-2">{predefinedPackages.filter((item) => packageCategory === "All" || item.category === packageCategory).map((item) => <button key={item.id} onClick={() => { setSelectedPackage(item); setSelected([]); }} className={cn("surface p-4 text-left", selectedPackage?.id === item.id && "border-primary")}><div className="flex justify-between gap-2"><span className="text-sm font-semibold">{item.name}</span><span className="text-sm font-semibold text-primary">{inr(item.price)}</span></div><p className="mt-1 text-xs text-muted-foreground">{item.included}</p><p className="mt-2 text-xs font-medium">{item.durationMinutes} minutes · {item.category}</p></button>)}</div><p className="mb-2 mt-5 text-sm font-semibold">Custom services</p><div className="flex flex-col gap-2">{services.map((service) => { const on = selected.includes(service.id); return <button key={service.id} onClick={() => { setSelectedPackage(null); setSelected((current) => on ? current.filter((id) => id !== service.id) : [...current, service.id]); }} className={cn("surface flex items-center gap-3 p-4 text-left", on && "border-primary")}><span className={cn("grid size-5 place-items-center rounded-md border", on && "border-primary bg-primary text-primary-foreground")}>{on && <Check className="size-3.5" />}</span><span className="flex-1"><span className="block text-sm font-medium">{service.name}</span><span className="block text-xs text-muted-foreground">{service.durationMinutes} minutes</span></span><span className="text-sm font-semibold text-primary">{inr(service.price)}</span></button>; })}</div></div>}
      {step === 1 && <div><label className="text-sm font-semibold">Appointment date<input value={appointmentDate} onChange={(event) => setAppointmentDate(event.target.value)} min={defaultAppointmentDate} type="date" className="mt-1.5 block w-full rounded-2xl border bg-card px-4 py-3 text-sm" /></label><p className="mt-4 text-sm font-semibold">Appointment time</p><div className="mt-2 flex flex-wrap gap-2">{["10:00", "12:00", "14:00", "16:00", "18:00"].map((time) => <button key={time} onClick={() => setSlot(time)} className={cn("rounded-full border px-4 py-2 text-sm font-medium", slot === time && "border-primary bg-primary text-primary-foreground")}>{time}</button>)}</div><label className="mt-4 block text-sm font-semibold">Or choose another time<input required type="time" value={slot} onChange={(event) => setSlot(event.target.value)} className="mt-1.5 block w-full rounded-2xl border bg-card px-4 py-3 text-sm" /></label><p className="mt-2 text-xs text-muted-foreground">You will receive reminders about 24 hours and 2 hours before this time.</p></div>}
      {step === 2 && <div className="flex flex-col gap-3"><label className="text-sm font-medium">Event location<input required value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Enter your event location" className="mt-1.5 w-full rounded-2xl border bg-card px-4 py-3 text-sm" /></label><label className="text-sm font-medium">Notes for the artist<textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} placeholder="Skin type, inspiration looks, travel instructions…" className="mt-1.5 w-full rounded-2xl border bg-card px-4 py-3 text-sm" /></label></div>}
      {step === 3 && <div className="surface p-4"><h3 className="text-sm font-semibold">Summary</h3><dl className="mt-3 space-y-2 text-sm"><div className="flex justify-between"><dt className="text-muted-foreground">Artist</dt><dd>{artist.name}</dd></div><div className="flex justify-between"><dt className="text-muted-foreground">Services</dt><dd>{serviceName}</dd></div><div className="flex justify-between"><dt className="text-muted-foreground">Appointment</dt><dd>{appointmentDate} · {slot}</dd></div><div className="flex justify-between border-t pt-2"><dt className="text-muted-foreground">Total</dt><dd className="font-semibold">{inr(total)}</dd></div><div className="flex justify-between"><dt className="text-muted-foreground">Advance now (20%)</dt><dd className="font-semibold text-primary">{inr(advance)}</dd></div></dl></div>}
    </div>
    {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
    <div className="mt-6 flex gap-2">{step > 0 && <button onClick={() => setStep((current) => current - 1)} className="flex-1 rounded-full border py-3 text-sm font-semibold">Back</button>}{step < steps.length - 1 ? <button disabled={services.length === 0} onClick={continueBooking} className="flex-[2] rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">Continue · {inr(total)}</button> : <button disabled={saving} onClick={() => void submit()} className="flex-[2] rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">{saving ? "Booking…" : `Pay ${inr(advance)} advance`}</button>}</div>
  </AppShell>;
}
