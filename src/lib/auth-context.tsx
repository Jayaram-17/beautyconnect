import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AccountRole, SessionUser } from "./auth-server";

type AuthContextValue = {
  user: SessionUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  updateProfile: (changes: Partial<Pick<SessionUser, "name" | "phone" | "city" | "artistryName" | "emailNotifications" | "bookingUpdates">>) => Promise<SessionUser>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const response = await fetch("/api/auth/me");
      const payload = (await response.json()) as { user?: SessionUser };
      setUser(payload.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  const updateProfile: AuthContextValue["updateProfile"] = async (changes) => {
    const response = await fetch("/api/auth/me", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(changes),
    });
    const payload = (await response.json()) as { user?: SessionUser; error?: string };
    if (!response.ok || !payload.user) throw new Error(payload.error ?? "Could not save your settings.");
    setUser(payload.user);
    return payload.user;
  };

  return <AuthContext.Provider value={{ user, loading, signOut, refresh, updateProfile }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}

export type { AccountRole, SessionUser };
