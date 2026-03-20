"use client";

import { RouteErrorState } from "@/components/layout/route-error-state";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorState
      reset={reset}
      title="Dashboard unavailable"
      description="The dashboard hit an unexpected problem. Reset the route to recover without losing the rest of the workspace."
    />
  );
}
