import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => { const saved = localStorage.getItem("glowlist-theme"); const next = saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches; setDark(next); document.documentElement.classList.toggle("dark", next); }, []);
  const toggle = () => { const next = !dark; setDark(next); document.documentElement.classList.toggle("dark", next); localStorage.setItem("glowlist-theme", next ? "dark" : "light"); };
  return <button onClick={toggle} aria-label={dark ? "Use light theme" : "Use dark theme"} className="grid size-10 place-items-center rounded-full border bg-card text-foreground transition-transform hover:scale-105 active:scale-95">{dark ? <Sun className="size-4" /> : <Moon className="size-4" />}</button>;
}
