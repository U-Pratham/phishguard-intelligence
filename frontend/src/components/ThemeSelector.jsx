import React from "react";
import { Palette } from "lucide-react";
import { THEMES, useTheme } from "../context/ThemeContext";

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 pg-surface">
      <Palette className="h-3.5 w-3.5 text-cyan-500" />
      <label htmlFor="theme-select" className="sr-only">
        Color theme
      </label>
      <select
        id="theme-select"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="bg-transparent text-xs font-medium pg-text-primary focus:outline-none cursor-pointer"
      >
        {THEMES.map((t) => (
          <option key={t.id} value={t.id} className="bg-slate-900 text-slate-100">
            {t.label}
          </option>
        ))}
      </select>
    </div>
  );
}
