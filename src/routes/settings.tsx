import { createFileRoute } from "@tanstack/react-router";
import { BellRing, Crosshair, Mail, Save, Smartphone } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { CityInput } from "@/components/city-input";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [city, setCity] = useState(user?.city ?? "");
  const [artistryName, setArtistryName] = useState(user?.artistryName ?? "");
  const [emailNotifications, setEmailNotifications] = useState(user?.emailNotifications ?? true);
  const [bookingUpdates, setBookingUpdates] = useState(user?.bookingUpdates ?? true);
  const [saving, setSaving] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ name, phone, city, artistryName: user?.role === "ARTIST" ? artistryName : undefined, emailNotifications, bookingUpdates });
      toast.success("Settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save your settings.");
    } finally {
      setSaving(false);
    }
  }

  function detectLocation() { if (!navigator.geolocation) return toast.error("Location detection is not supported in this browser."); navigator.geolocation.getCurrentPosition(async ({ coords }) => { try { const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}`); const payload = await response.json() as { address?: Record<string, string> }; const address = payload.address ?? {}; const detected = address.city || address.town || address.village || address.county || address.state; if (!detected) throw new Error(); setCity(detected); toast.success("Location detected"); } catch { toast.error("Could not determine your city. Please enter it manually."); } }, () => toast.error("Location permission was not granted.")); }

  return <AppShell title="Settings" subtitle="Manage your account"><form onSubmit={save} className="space-y-5">
    <section className="surface p-4"><h2 className="text-sm font-bold">Personal details</h2><p className="mt-1 text-xs text-muted-foreground">Used on your Glowlist profile and booking updates.</p><div className="mt-4 space-y-3"><Input label="Full name" value={name} onChange={setName} placeholder="Your name" />{user?.role === "ARTIST" && <Input label="Artistry name" value={artistryName} onChange={setArtistryName} placeholder="Your studio name" />}<Input label="Phone number" value={phone} onChange={setPhone} placeholder="+91 98765 43210" type="tel" /><label className="block text-xs font-bold">City<div className="mt-1.5 flex gap-2"><CityInput value={city} onChange={setCity} placeholder="Start typing your city" className="h-11 min-w-0 flex-1 rounded-xl border bg-background px-3 text-sm font-normal outline-none ring-primary focus:ring-2" /><button type="button" onClick={detectLocation} className="inline-flex h-11 items-center gap-1 rounded-xl border px-3 text-xs font-bold text-primary"><Crosshair className="size-3.5" />Detect</button></div></label></div></section>
    <section className="surface overflow-hidden p-0"><div className="border-b px-4 py-3"><h2 className="text-sm font-bold">Notifications</h2></div><Preference icon={BellRing} title="Booking updates" detail="Requests, confirmations and reminders" checked={bookingUpdates} onCheckedChange={setBookingUpdates} /><Preference icon={Mail} title="Email updates" detail="Product news and account updates" checked={emailNotifications} onCheckedChange={setEmailNotifications} /></section>
    <section className="surface flex gap-3 p-4"><Smartphone className="mt-0.5 size-4 shrink-0 text-primary" /><p className="text-xs leading-5 text-muted-foreground">Push notifications can be enabled when Glowlist is installed as an app. Booking preferences are saved now.</p></section>
    <button disabled={saving} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-bold text-primary-foreground disabled:opacity-60"><Save className="size-4" />{saving ? "Saving…" : "Save changes"}</button>
  </form></AppShell>;
}

function Input({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string }) { return <label className="block text-xs font-bold">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-1.5 h-11 w-full rounded-xl border bg-background px-3 text-sm font-normal outline-none ring-primary focus:ring-2" /></label>; }
function Preference({ icon: Icon, title, detail, checked, onCheckedChange }: { icon: typeof BellRing; title: string; detail: string; checked: boolean; onCheckedChange: (checked: boolean) => void }) { return <div className="flex items-center gap-3 px-4 py-3.5"><Icon className="size-4 text-primary" /><span className="flex-1"><span className="block text-sm font-semibold">{title}</span><span className="block text-xs text-muted-foreground">{detail}</span></span><Switch checked={checked} onCheckedChange={onCheckedChange} /></div>; }
