import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Check, Clock, MapPin, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { ArtistAvatar, StatusPill } from "@/components/glam-ui";
import type { BookingStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pro/bookings")({ component: ArtistBookings });
type Booking = { id: string; customerName: string; service: string; date: string; time: string; location: string; total: number; advance: number; status: BookingStatus };
const tabs: Record<string, BookingStatus[]> = { Requests: ["PENDING"], Confirmed: ["ACCEPTED", "CONFIRMED"], History: ["COMPLETED", "CANCELLED", "REJECTED"] };
const inr = (amount: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

function ArtistBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState<keyof typeof tabs>("Requests");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingAdvance, setSavingAdvance] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/bookings").then(async (response) => {
      const data = await response.json() as { bookings?: Booking[]; error?: string };
      if (!response.ok) throw new Error(data.error);
      const loaded = data.bookings ?? [];
      setBookings(loaded);
      setDrafts(Object.fromEntries(loaded.map((booking) => [booking.id, String(booking.advance ?? 0)])));
    }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load bookings.")).finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => bookings.filter((booking) => tabs[tab]!.includes(booking.status)), [bookings, tab]);
  const updateStatus = async (id: string, status: "ACCEPTED" | "REJECTED" | "COMPLETED") => {
    try {
      const response = await fetch(`/api/bookings/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status }) });
      const data = await response.json() as { booking?: Booking; error?: string };
      if (!response.ok || !data.booking) throw new Error(data.error ?? "Could not update booking.");
      setBookings((current) => current.map((booking) => booking.id === id ? { ...booking, status: data.booking!.status } : booking));
      toast.success(status === "ACCEPTED" ? "Booking accepted" : status === "REJECTED" ? "Booking declined" : "Booking completed");
    } catch (reason) { toast.error(reason instanceof Error ? reason.message : "Could not update booking."); }
  };
  const saveAdvance = async (booking: Booking) => {
    const draft = drafts[booking.id] ?? "";
    const advance = draft.trim() === "" ? 0 : Number(draft);
    if (!Number.isInteger(advance) || advance < 0 || advance > booking.total) {
      toast.error("Enter an advance between ₹0 and the service charge.");
      return;
    }
    setSavingAdvance(booking.id);
    try {
      const response = await fetch(`/api/bookings/${booking.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ advance }) });
      const data = await response.json() as { booking?: Booking; error?: string };
      if (!response.ok || !data.booking) throw new Error(data.error ?? "Could not save the advance.");
      setBookings((current) => current.map((item) => item.id === booking.id ? { ...item, advance: data.booking!.advance } : item));
      setDrafts((current) => ({ ...current, [booking.id]: String(data.booking!.advance) }));
      toast.success(advance ? "Advance payment recorded" : "Advance payment cleared");
    } catch (reason) { toast.error(reason instanceof Error ? reason.message : "Could not save the advance."); } finally { setSavingAdvance(null); }
  };

  return <AppShell title="Bookings" subtitle="Manage your real booking requests">
    <div className="flex gap-1 rounded-2xl bg-muted p-1">{Object.keys(tabs).map((name) => <button key={name} onClick={() => setTab(name as keyof typeof tabs)} className={cn("flex-1 rounded-xl py-2 text-sm font-semibold", tab === name ? "bg-card shadow-soft" : "text-muted-foreground")}>{name}</button>)}</div>
    {loading && <p className="surface mt-4 text-sm text-muted-foreground">Loading bookings…</p>}{error && <p className="surface mt-4 text-sm text-destructive">{error}</p>}
    <div className="mt-4 flex flex-col gap-3">{visible.map((booking) => {
      const initials = booking.customerName.split(" ").map((part) => part[0] ?? "").join("").slice(0, 2);
      const advance = Number(drafts[booking.id] ?? booking.advance ?? 0) || 0;
      const balance = Math.max(booking.total - advance, 0);
      return <div key={booking.id} className="surface p-4"><div className="flex items-start gap-3"><ArtistAvatar initials={initials} hue={300} className="size-11" /><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-semibold">{booking.customerName}</h3><p className="truncate text-xs text-muted-foreground">{booking.service}</p></div><StatusPill status={booking.status} /></div><div className="mt-3 grid gap-1.5 text-xs text-muted-foreground"><span className="flex items-center gap-2"><CalendarDays className="size-3.5" />{booking.date}</span><span className="flex items-center gap-2"><Clock className="size-3.5" />{booking.time}</span><span className="flex items-center gap-2"><MapPin className="size-3.5" />{booking.location}</span></div><div className="mt-4 grid grid-cols-3 gap-2 text-center"><AmountBox label="Actual amount" value={inr(booking.total)} /><AmountBox label="Advance amount" value={inr(advance)} accent /><AmountBox label="Balance amount" value={inr(balance)} /></div><div className="mt-3 rounded-2xl border bg-muted/30 p-3"><label className="block text-xs font-semibold">Advance amount <span className="font-normal text-muted-foreground">(optional)</span><div className="mt-1.5 flex gap-2"><input type="number" min="0" max={booking.total} step="1" value={drafts[booking.id] ?? ""} onChange={(event) => setDrafts((current) => ({ ...current, [booking.id]: event.target.value }))} placeholder="0" className="h-10 min-w-0 flex-1 rounded-xl border bg-background px-3 text-sm" /><button type="button" onClick={() => void saveAdvance(booking)} disabled={savingAdvance === booking.id} className="rounded-xl bg-primary px-3 text-xs font-bold text-primary-foreground disabled:opacity-60">{savingAdvance === booking.id ? "Saving…" : "Save"}</button></div></label></div><div className="mt-3 flex items-center justify-between border-t pt-3"><span className="text-xs text-muted-foreground">{balance ? `${inr(balance)} due after advance` : "Paid in full"}</span>{booking.status === "PENDING" && <div className="flex gap-2"><button onClick={() => void updateStatus(booking.id, "REJECTED")} className="flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold text-destructive"><X className="size-3.5" />Decline</button><button onClick={() => void updateStatus(booking.id, "ACCEPTED")} className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"><Check className="size-3.5" />Accept</button></div>}{booking.status === "ACCEPTED" && <button onClick={() => void updateStatus(booking.id, "COMPLETED")} className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Mark complete</button>}</div></div>;
    })}</div>
    {!loading && !error && visible.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">No {tab.toLowerCase()} bookings yet.</p>}
  </AppShell>;
}

function AmountBox({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) { return <div className={cn("rounded-xl border p-2.5", accent && "border-primary/30 bg-primary/10")}><p className="text-[0.62rem] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p><p className={cn("mt-1 text-sm font-bold", accent && "text-primary")}>{value}</p></div>; }
