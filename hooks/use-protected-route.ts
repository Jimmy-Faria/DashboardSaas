"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { logoutUser } from "@/lib/supabase/auth";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { useProjectStore } from "@/store/useProjectStore";

export const useProtectedRoute = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasMounted = useHasMounted();
  const currentUser = useProjectStore((state) => state.currentUser);
  const hasHydrated = useProjectStore((state) => state.hasHydrated);
  const setCurrentUser = useProjectStore((state) => state.setCurrentUser);
  const redirectStartedRef = useRef(false);

  useEffect(() => {
    if (!hasMounted || !hasHydrated || currentUser || redirectStartedRef.current) {
      return;
    }

    redirectStartedRef.current = true;

    const nextPath = searchParams.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;
    const loginPath = `/login?next=${encodeURIComponent(nextPath)}`;

    void logoutUser().finally(() => {
      setCurrentUser(null);
      router.replace(loginPath);
      router.refresh();
    });
  }, [
    currentUser,
    hasHydrated,
    hasMounted,
    pathname,
    router,
    searchParams,
    setCurrentUser,
  ]);

  return {
    hasMounted,
    hasHydrated,
    currentUser,
    isCheckingAuth: !hasMounted || !hasHydrated || !currentUser,
  };
};
