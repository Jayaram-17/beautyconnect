import { createFileRoute } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { notifications } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications | Glowlist" },
      {
        name: "description",
        content:
          "Booking requests, payment confirmations and appointment reminders, all in one feed.",
      },
      { property: "og:title", content: "Notifications | Glowlist" },
      {
        property: "og:description",
        content: "Booking requests, payments and appointment reminders.",
      },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  return (
    <AppShell title="Notifications" subtitle="Requests, payments and reminders">
      <div className="flex flex-col gap-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={cn("surface flex gap-3 p-4", n.unread && "border-primary/30 bg-accent/30")}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <Bell className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="truncate text-sm font-semibold">{n.title}</h3>
                <span className="shrink-0 text-[0.7rem] text-muted-foreground">{n.time}</span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
