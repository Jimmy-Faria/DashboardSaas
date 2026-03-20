"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { ThemeProvider } from "@/components/theme-provider";
import { subscribeToAuthChanges } from "@/lib/supabase/auth";
import { Toaster } from "@/components/ui/sonner";
import { useProjectStore } from "@/store/useProjectStore";

function StoreBootstrap() {
  const initializeApp = useProjectStore((state) => state.initializeApp);

  useEffect(() => {
    void initializeApp();

    return subscribeToAuthChanges((event) => {
      if (
        event === "SIGNED_IN" ||
        event === "SIGNED_OUT" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED"
      ) {
        void initializeApp();
      }
    });
  }, [initializeApp]);

  return null;
}

function ThemeBootstrap() {
  const { resolvedTheme, setTheme } = useTheme();
  const hasHydrated = useProjectStore((state) => state.hasHydrated);
  const theme = useProjectStore((state) => state.preferences.theme);
  const setThemePreference = useProjectStore((state) => state.setThemePreference);
  const bootstrappedRef = useRef(false);
  const fallbackTheme = theme === "light" || theme === "dark" ? theme : "dark";

  useEffect(() => {
    if (!hasHydrated || bootstrappedRef.current) {
      return;
    }

    setTheme(fallbackTheme);
    bootstrappedRef.current = true;
  }, [fallbackTheme, hasHydrated, setTheme]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    const nextTheme =
      resolvedTheme === "light" || resolvedTheme === "dark"
        ? resolvedTheme
        : "dark";
    document.documentElement.style.colorScheme = nextTheme;

    if (theme !== nextTheme) {
      setThemePreference(nextTheme);
    }
  }, [hasHydrated, resolvedTheme, setThemePreference, theme]);

  return null;
}

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={true}
      disableTransitionOnChange
    >
      <StoreBootstrap />
      <ThemeBootstrap />
      {children}
      <Toaster richColors closeButton position="top-right" />
    </ThemeProvider>
  );
}
