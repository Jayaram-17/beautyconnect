import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/")({
  component: RootIndexRedirect,
});

function RootIndexRedirect() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        window.location.assign("/auth");
      } else if (user.role === "ARTIST") {
        window.location.assign("/pro");
      } else {
        window.location.assign("/coming-soon");
      }
    }
  }, [loading, user]);

  return (
    <div className="grid min-h-screen place-items-center bg-secondary/60 text-sm text-muted-foreground font-medium">
      Loading Glowlist Studio…
    </div>
  );
}
