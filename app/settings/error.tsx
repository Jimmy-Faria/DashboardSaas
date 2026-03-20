"use client";

import { RouteErrorState } from "@/components/layout/route-error-state";

export default function SettingsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorState
      reset={reset}
      title="Settings unavailable"
      description="The settings route failed to load. Reset this section and continue working elsewhere in the workspace."
      href="/dashboard"
      hrefLabel="Back to dashboard"
    />
  );
}
