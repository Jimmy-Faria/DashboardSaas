"use client";

import { MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { useProjectStore } from "@/store/useProjectStore";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const hasMounted = useHasMounted();
  const hasHydrated = useProjectStore((state) => state.hasHydrated);

  if (!hasMounted || !hasHydrated) {
    return <div className="h-10 w-[9.5rem] rounded-2xl border border-border/60 bg-card/60" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => {
        setTheme(isDark ? "light" : "dark");
      }}
      className="h-10 w-10 rounded-2xl border-border/60 bg-card/90 shadow-sm backdrop-blur-sm"
    >
      {isDark ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
      <span className="sr-only">{isDark ? "Light mode" : "Dark mode"}</span>
    </Button>
  );
}
