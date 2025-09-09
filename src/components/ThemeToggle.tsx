"use client";

import { useTheme } from "next-themes";
import React from "react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDark = (resolvedTheme ?? theme) === "dark";
  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
    >
      <span className="hidden sm:inline">{isDark ? "Dark" : "Light"}</span>
      <span aria-hidden>{isDark ? "🌙" : "☀️"}</span>
    </button>
  );
}


