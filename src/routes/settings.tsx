import { createFileRoute } from "@tanstack/react-router";
import { BellRing, Crosshair, Globe, Key, LogOut, Mail, MessageCircle, Phone, Save, ShieldCheck, Smartphone, User } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { CityInput } from "@/components/city-input";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  const { user, updateProfile, signOut } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [city, setCity] = useState(user?.city ?? "");
  const [artistryName, setArtistryName] = useState(user?.artistryName ?? "");
  const [emailNotifications, setEmailNotifications] = useState(user?.emailNotifications ?? true);
  const [bookingUpdates, setBookingUpdates] = useState(user?.bookingUpdates ?? true);
  const [saving, setSaving] = useState(false);

  // CallMeBot WhatsApp config (artist only)
  const [waPhone, setWaPhone] = useState("");
  const [waApikey, setWaApikey] = useState("");
  const [waLoading, setWaLoading] = useState(false);
  const [waSaving, setWaSaving] = useState(false);

  useEffect(() => {
    if (user?.role === "ARTIST") {
      setWaLoading(true);
      void fetch("/api/artists/me/whatsapp")
        .then((res) => (res.ok ? res.json() : { phone: "", apikey: "" }))
        .then((data: { phone?: string; apikey?: string }) => {
          setWaPhone(data.phone ?? "");
          setWaApikey(data.apikey ?? "");
        })
        .catch(() => null)
        .finally(() => setWaLoading(false));
    }
  }, [user?.role]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const changes: Parameters<typeof updateProfile>[0] = {
        name,
        phone,
        city,
        emailNotifications,
        bookingUpdates,
      };
      if (user?.role === "ARTIST") changes.artistryName = artistryName;
      await updateProfile(changes);
      toast.success("Personal & Studio details saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save your settings.");
    } finally {
      setSaving(false);
    }
  }

  async function saveWhatsApp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWaSaving(true);
    try {
      const res = await fetch("/api/artists/me/whatsapp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone: waPhone, apikey: waApikey }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error);
      toast.success("WhatsApp reminder settings saved!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save WhatsApp settings.");
    } finally {
      setWaSaving(false);
    }
  }

  function detectLocation() {
    if (!navigator.geolocation) {
      toast.error("Location detection is not supported in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}`,
          );
          const payload = (await response.json()) as { address?: Record<string, string | undefined> };
          const address = payload.address ?? {};
          const detected = address["city"] || address["town"] || address["village"] || address["county"] || address["state"];
          if (!detected) throw new Error();
          setCity(detected);
          toast.success("Location detected");
        } catch {
          toast.error("Could not determine your city. Please enter it manually.");
        }
      },
      () => toast.error("Location permission was not granted."),
    );
  }

  return (
    <AppShell title="Settings" subtitle="Studio preferences, WhatsApp alerts & account">
      <div className="space-y-5">
        {/* Account Info Badge */}
        <section className="surface p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary font-bold">
              <User className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[0.65rem] font-bold text-primary">
            {user?.role === "ARTIST" ? "Studio Artist" : "Account"}
          </span>
        </section>

        {/* Personal & Studio Details Form */}
        <form onSubmit={save} className="space-y-4">
          <section className="surface p-4">
            <h2 className="text-sm font-bold">Studio Profile & Personal Details</h2>
            <p className="mt-1 text-xs text-muted-foreground">Used for your studio profile and booking records.</p>
            <div className="mt-4 space-y-3">
              <Input label="Full name" value={name} onChange={setName} placeholder="Your name" />
              {user?.role === "ARTIST" && (
                <Input label="Artistry / Studio Name" value={artistryName} onChange={setArtistryName} placeholder="Your studio name" />
              )}
              <Input label="Phone number" value={phone} onChange={setPhone} placeholder="+91 98765 43210" type="tel" />
              <label className="block text-xs font-bold">
                City
                <div className="mt-1.5 flex gap-2">
                  <CityInput
                    value={city}
                    onChange={setCity}
                    placeholder="Start typing your city"
                    className="h-11 min-w-0 flex-1 rounded-xl border bg-background px-3 text-sm font-normal outline-none ring-primary focus:ring-2"
                  />
                  <button
                    type="button"
                    onClick={detectLocation}
                    className="inline-flex h-11 items-center gap-1 rounded-xl border px-3 text-xs font-bold text-primary"
                  >
                    <Crosshair className="size-3.5" />
                    Detect
                  </button>
                </div>
              </label>
            </div>
          </section>

          <section className="surface overflow-hidden p-0">
            <div className="border-b px-4 py-3">
              <h2 className="text-sm font-bold">Notification Preferences</h2>
            </div>
            <Preference
              icon={BellRing}
              title="Booking updates"
              detail="In-app alerts for bookings & reminders"
              checked={bookingUpdates}
              onCheckedChange={setBookingUpdates}
            />
            <Preference
              icon={Mail}
              title="Email updates"
              detail="Account updates and notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </section>

          <button
            disabled={saving}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            <Save className="size-4" />
            {saving ? "Saving…" : "Save Personal Details"}
          </button>
        </form>

        {/* CallMeBot WhatsApp Configuration — Artist Only */}
        {user?.role === "ARTIST" && (
          <form onSubmit={saveWhatsApp} className="space-y-4">
            <section className="surface p-4">
              <div className="flex items-center gap-2 mb-1">
                <MessageCircle className="size-4 text-success" />
                <h2 className="text-sm font-bold">WhatsApp Automated Reminders (CallMeBot)</h2>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Receive 24H & 2H appointment reminders sent directly to your WhatsApp — completely free.
              </p>

              <div className="mt-4 rounded-2xl border bg-accent/30 p-3">
                <p className="text-xs font-bold mb-2">How to set up (one-time):</p>
                <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal pl-4 leading-relaxed">
                  <li>Save <span className="font-bold text-foreground">+34 644 65 21 00</span> in your contacts as "CallMeBot"</li>
                  <li>Open WhatsApp → send message: <span className="font-bold text-foreground">I allow callmebot to send me messages</span></li>
                  <li>You will receive a reply message containing your <span className="font-bold text-foreground">API key</span></li>
                  <li>Enter your WhatsApp phone number and API key below and hit Save</li>
                </ol>
              </div>

              <div className="mt-4 space-y-3">
                <label className="block text-xs font-bold">
                  <span className="flex items-center gap-1">
                    <Phone className="size-3" /> WhatsApp Phone Number
                  </span>
                  <input
                    type="tel"
                    value={waPhone}
                    onChange={(e) => setWaPhone(e.target.value)}
                    placeholder="919876543210 (country code + phone, no +)"
                    className="mt-1.5 h-11 w-full rounded-xl border bg-background px-3 text-sm font-normal outline-none ring-primary focus:ring-2"
                  />
                </label>
                <label className="block text-xs font-bold">
                  <span className="flex items-center gap-1">
                    <Key className="size-3" /> CallMeBot API Key
                  </span>
                  <input
                    type="text"
                    value={waApikey}
                    onChange={(e) => setWaApikey(e.target.value)}
                    placeholder="Your CallMeBot API key"
                    className="mt-1.5 h-11 w-full rounded-xl border bg-background px-3 text-sm font-normal outline-none ring-primary focus:ring-2"
                  />
                </label>
              </div>
            </section>

            <button
              disabled={waSaving || waLoading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-success text-sm font-bold text-white disabled:opacity-60"
            >
              <MessageCircle className="size-4" />
              {waSaving ? "Saving…" : "Save WhatsApp Credentials"}
            </button>
          </form>
        )}

        {/* Regional & Studio Preferences */}
        <section className="surface p-4">
          <h2 className="text-sm font-bold flex items-center gap-2 mb-3">
            <Globe className="size-4 text-primary" /> Regional Studio Preferences
          </h2>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border p-3 bg-card">
              <span className="text-muted-foreground block">Operating Currency</span>
              <span className="font-bold text-sm text-foreground mt-1 block">INR (₹ Rupees)</span>
            </div>
            <div className="rounded-xl border p-3 bg-card">
              <span className="text-muted-foreground block">Timezone</span>
              <span className="font-bold text-sm text-foreground mt-1 block">IST (Asia/Kolkata)</span>
            </div>
          </div>
        </section>

        {/* Single Dedicated Account Sign Out Section */}
        <section className="surface p-4 border-destructive/30">
          <h2 className="text-sm font-bold text-destructive flex items-center gap-2">
            <ShieldCheck className="size-4" /> Account Actions
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">Sign out of your Glowlist Studio account safely.</p>
          <button
            type="button"
            onClick={() => void signOut().then(() => window.location.assign("/auth"))}
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-destructive/40 bg-destructive/10 text-sm font-bold text-destructive hover:bg-destructive/20"
          >
            <LogOut className="size-4" /> Sign Out of Studio
          </button>
        </section>
      </div>
    </AppShell>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block text-xs font-bold">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1.5 h-11 w-full rounded-xl border bg-background px-3 text-sm font-normal outline-none ring-primary focus:ring-2"
      />
    </label>
  );
}

function Preference({
  icon: Icon,
  title,
  detail,
  checked,
  onCheckedChange,
}: {
  icon: typeof BellRing;
  title: string;
  detail: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <Icon className="size-4 text-primary" />
      <span className="flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-xs text-muted-foreground">{detail}</span>
      </span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
