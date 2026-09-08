import { createFileRoute } from "@tanstack/react-router";
import { Bell, CheckCheck, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/notifications")({ component: NotificationsPage });

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch("/api/notifications")
      .then(async (res) => {
        const data = (await res.json()) as { notifications?: NotificationItem[]; error?: string };
        if (!res.ok) throw new Error(data.error);
        setNotifications(data.notifications ?? []);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load notifications."))
      .finally(() => setLoading(false));

    // Automatically mark notifications as read on view
    void fetch("/api/notifications/read", { method: "POST" }).catch(() => null);
  }, []);

  return (
    <AppShell title="Notifications" subtitle="Booking updates, reminders & confirmations">
      {error && <p className="surface text-sm text-destructive">{error}</p>}
      {loading && <p className="surface text-sm text-muted-foreground">Loading notifications…</p>}

      {!loading && notifications.length > 0 && (
        <div className="flex flex-col gap-3">
          {notifications.map((item) => {
            const isUnread = !item.readAt;
            return (
              <div
                key={item.id}
                className={`surface p-4 transition-all ${
                  isUnread ? "border-primary/40 bg-primary/5 shadow-soft" : "opacity-90"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`grid size-8 shrink-0 place-items-center rounded-full ${
                        isUnread ? "bg-primary text-primary-foreground" : "bg-accent text-foreground"
                      }`}
                    >
                      <Bell className="size-4" />
                    </span>
                    <h3 className="truncate text-sm font-semibold">{item.title}</h3>
                  </div>
                  {isUnread && (
                    <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[0.6rem] font-bold text-primary-foreground">
                      New
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed pl-10">{item.body}</p>
                <p className="mt-2 text-[0.65rem] text-muted-foreground/80 flex items-center gap-1 pl-10">
                  <Clock className="size-3" /> {new Date(item.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {!loading && !notifications.length && (
        <div className="surface flex flex-col items-center gap-2 py-14 text-center">
          <CheckCheck className="size-8 text-primary" />
          <h2 className="text-base font-semibold">You’re all caught up!</h2>
          <p className="max-w-xs text-xs text-muted-foreground leading-relaxed">
            Automatic booking confirmations, 24H & 2H reminders, and payment updates will appear here live.
          </p>
        </div>
      )}
    </AppShell>
  );
}
