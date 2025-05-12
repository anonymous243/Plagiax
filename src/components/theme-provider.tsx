"use client";

import * as React from "react";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: "system" | "light" | "dark";
  storageKey?: string;
};

type ThemeProviderState = {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark" | "system") => void;
};

const initialState: ThemeProviderState = {
  theme: "system" as unknown as "light" | "dark", // Will be resolved to light/dark in useEffect
  setTheme: () => null,
};

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<"light" | "dark" | "system">(() => {
    if (typeof window === "undefined") {
      return defaultTheme;
    }
    return (localStorage.getItem(storageKey) as "light" | "dark" | "system") || defaultTheme;
  });

  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    let effectiveTheme = theme;
    if (theme === "system") {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    
    root.classList.add(effectiveTheme);
    // Store the user's explicit choice, or if system, store 'system'
    localStorage.setItem(storageKey, theme);

  }, [theme, storageKey]);

  const value = {
    theme: theme === "system" 
      ? (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") 
      : theme,
    setTheme: (newTheme: "light" | "dark" | "system") => {
      setTheme(newTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
