import React, { createContext, useContext, useEffect, useState } from "react";

export const THEMES = [
  { id: "dark", label: "Dark" },
  { id: "light", label: "Light" },
  { id: "midnight", label: "Midnight" },
  { id: "high-contrast", label: "High Contrast" },
];

const THEME_STORAGE_KEY = "phishguard_theme";

const ThemeContext = createContext({
  theme: "dark",
  setTheme: () => {},
});

function getInitialTheme() {
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (THEMES.some((t) => t.id === saved)) {
      return saved;
    }
  } catch {
    // ignore storage errors
  }
  return "dark";
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  const setTheme = (nextTheme) => {
    if (THEMES.some((t) => t.id === nextTheme)) {
      setThemeState(nextTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
