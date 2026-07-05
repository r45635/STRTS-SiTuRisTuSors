"use client";

import { useEffect } from "react";
import { chargerTheme, appliquerTheme, type Theme } from "@/lib/theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const theme = chargerTheme();
    appliquerTheme(theme);

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => appliquerTheme("system");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, []);

  return <>{children}</>;
}

export function useTheme() {
  const setTheme = (theme: Theme) => {
    const { sauvegarderTheme, appliquerTheme: apply } = require("@/lib/theme");
    sauvegarderTheme(theme);
    apply(theme);
  };

  const getTheme = (): Theme => {
    if (typeof window === "undefined") return "system";
    const { chargerTheme: load } = require("@/lib/theme");
    return load();
  };

  return { setTheme, getTheme };
}
