import { createFileRoute } from "@tanstack/react-router";
import { Crosshair, Crown, Eye, EyeOff, Sparkles } from "lucide-react";
import { useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { toast } from "sonner";
import { CityInput } from "@/components/city-input";
import type { AccountRole } from "@/lib/auth-context";

export const Route = createFileRoute("/auth")({ component: AuthPage });

function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<AccountRole>("USER");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const [city, setCity] = useState("");

  async function detectLocation() {
    if (!navigator.geolocation) {
      toast.error("Location detection is not supported in this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}`);
        const place = (await response.json()) as { address?: Record<string, string | undefined> };
        const address = place.address ?? {};
        const detected = address["city"] || address["town"] || address["village"] || address["county"] || address["state"];
        if (!detected) throw new Error();
        setCity(detected);
        toast.success("Location detected");
      } catch { toast.error("We found your position, but could not determine the city. Please enter it manually."); }
      finally { setLocating(false); }
    }, () => { setLocating(false); toast.error("Location permission was not granted. Please enter your city."); }, { timeout: 10000 });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    try {
      const response = await fetch(`/api/auth/${mode === "login" ? "login" : "register"}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          password: form.get("password"),
          role,
          city,
          artistryName: form.get("artistryName"),
        }),
      });
      const payload = (await response.json()) as { error?: string; user?: { role: AccountRole } };
      if (!response.ok || !payload.user) throw new Error(payload.error ?? "Please try again.");
      window.location.assign(payload.user.role === "ARTIST" ? "/pro" : "/coming-soon");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-secondary px-5 py-8 sm:grid sm:place-items-center">
      <section className="mx-auto w-full max-w-md rounded-[2rem] border bg-background p-6 shadow-lift sm:p-8">
        <div className="flex items-center gap-2 text-primary"><Sparkles className="size-5" /><span className="text-sm font-bold tracking-wide">GLOWLIST</span></div>
        <h1 className="mt-8 font-display text-3xl font-semibold">{mode === "login" ? "Welcome back" : "Your next look starts here"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{mode === "login" ? "Sign in to manage your beauty journey." : "Create an account to book beauty experts or grow your artistry business."}</p>

        {mode === "signup" && (
          <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1.5">
            <RoleButton active={role === "USER"} onClick={() => setRole("USER")} icon={<Sparkles className="size-4" />} title="I’m a client" subtitle="Book artists" />
            <RoleButton active={role === "ARTIST"} onClick={() => setRole("ARTIST")} icon={<Crown className="size-4" />} title="I’m an artist" subtitle="Run my studio" />
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={submit}>
          {mode === "signup" && <Field label="Full name" name="name" placeholder="Your name" autoComplete="name" />}
          {mode === "signup" && role === "ARTIST" && <Field label="Artistry name" name="artistryName" placeholder="e.g. Priya Makeup Studio" />}
          {mode === "signup" && <label className="block text-sm font-semibold">Your location<span className="relative mt-1.5 flex gap-2"><CityInput required value={city} onChange={setCity} placeholder="Start typing your city" className="h-12 min-w-0 flex-1 rounded-xl border bg-card px-3 text-sm outline-none ring-primary focus:ring-2" /><button type="button" onClick={() => void detectLocation()} disabled={locating} className="inline-flex h-12 shrink-0 items-center gap-1 rounded-xl border px-3 text-xs font-bold text-primary disabled:opacity-60"><Crosshair className="size-4" />{locating ? "Finding…" : "Detect"}</button></span></label>}
          <Field label="Email address" name="email" type="email" placeholder="you@example.com" autoComplete="email" />
          <label className="block text-sm font-semibold">Password
            <span className="relative mt-1.5 block"><input required minLength={8} name="password" type={showPassword ? "text" : "password"} placeholder="At least 8 characters" autoComplete={mode === "login" ? "current-password" : "new-password"} className="h-12 w-full rounded-xl border bg-card px-3 pr-11 text-sm outline-none ring-primary focus:ring-2" />
              <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Show or hide password" className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted-foreground">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
            </span>
          </label>
          <button disabled={submitting} className="h-12 w-full rounded-full bg-primary text-sm font-bold text-primary-foreground disabled:opacity-60">{submitting ? "Please wait…" : mode === "login" ? "Sign in" : role === "ARTIST" ? "Create artist account" : "Create account"}</button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">{mode === "login" ? "New to Glowlist?" : "Already have an account?"} <button className="font-bold text-primary" onClick={() => setMode(mode === "login" ? "signup" : "login")}>{mode === "login" ? "Create one" : "Sign in"}</button></p>
      </section>
    </main>
  );
}

function Field({ label, name, ...props }: { label: string; name: string } & InputHTMLAttributes<HTMLInputElement>) {
  return <label className="block text-sm font-semibold">{label}<input required name={name} {...props} className="mt-1.5 h-12 w-full rounded-xl border bg-card px-3 text-sm outline-none ring-primary focus:ring-2" /></label>;
}

function RoleButton({ active, onClick, icon, title, subtitle }: { active: boolean; onClick: () => void; icon: ReactNode; title: string; subtitle: string }) {
  return <button type="button" onClick={onClick} className={`rounded-xl p-3 text-left transition-colors ${active ? "bg-background text-primary shadow-soft" : "text-muted-foreground"}`}><span className="flex items-center gap-1.5 text-sm font-bold">{icon}{title}</span><span className="mt-0.5 block text-[0.7rem]">{subtitle}</span></button>;
}
