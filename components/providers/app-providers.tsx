"use client";

import { useEffect } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { useProjectStore } from "@/store/useProjectStore";

function StoreBootstrap() {
  const syncCurrentUser = useProjectStore((state) => state.syncCurrentUser);

  useEffect(() => {
    syncCurrentUser();
  }, [syncCurrentUser]);

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
      enableSystem={false}
      disableTransitionOnChange
    >
      <StoreBootstrap />
      {children}
      <Toaster richColors closeButton position="top-right" />
    </ThemeProvider>
  );
}
