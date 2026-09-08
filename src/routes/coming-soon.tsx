import { createFileRoute } from "@tanstack/react-router";
import { Construction, Sparkles } from "lucide-react";

export const Route = createFileRoute("/coming-soon")({ component: ComingSoonPage });

function ComingSoonPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-secondary/60 p-6">
      <div className="mx-auto w-full max-w-[400px] rounded-3xl bg-background p-8 text-center shadow-lift">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10">
          <Construction className="size-8 text-primary" />
        </div>
        <h1 className="mt-5 text-2xl font-bold">Coming Soon</h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          The client booking experience is currently under development.
          We're building something beautiful for you!
        </p>
        <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-accent/60 px-4 py-3">
          <Sparkles className="size-4 text-primary" />
          <p className="text-xs font-semibold text-foreground">
            Artist Studio is live — artists can sign in now
          </p>
        </div>
        <button
          onClick={() => window.location.assign("/auth")}
          className="mt-6 h-11 w-full rounded-full bg-primary text-sm font-bold text-primary-foreground"
        >
          Go to Sign In
        </button>
      </div>
    </div>
  );
}
