"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return (
    <div style={{ height: "30px", width: "80px", borderRadius: "6px", background: "var(--muted-bg)" }} />
  );

  const currentTheme = theme === "system" ? resolvedTheme : theme;

  return (
    <button
      onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
      style={{
        display: "flex", alignItems: "center", gap: "7px",
        width: "100%", padding: "6px 10px", borderRadius: "6px",
        fontSize: "12px", color: "var(--muted)",
        background: "transparent", border: "none", cursor: "pointer",
        transition: "background .12s",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--muted-bg)"; (e.currentTarget as HTMLElement).style.color = "var(--foreground)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--muted)"; }}
    >
      <i className={`ti ${currentTheme === "dark" ? "ti-sun" : "ti-moon"}`} style={{ fontSize: "15px" }} aria-hidden="true" />
      {currentTheme === "dark" ? "Light mode" : "Dark mode"}
    </button>
  );
}
