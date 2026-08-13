import { createFileRoute } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/notifications")({ component: NotificationsPage });
function NotificationsPage() { return <AppShell title="Notifications" subtitle="Requests, payments and reminders"><div className="surface flex flex-col items-center gap-2 py-14 text-center"><Bell className="size-7 text-primary" /><h2 className="text-base font-semibold">You’re all caught up</h2><p className="max-w-xs text-sm text-muted-foreground">New booking and payment updates will appear here.</p></div></AppShell>; }
