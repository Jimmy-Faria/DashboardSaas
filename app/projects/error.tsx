"use client";

import { RouteErrorState } from "@/components/layout/route-error-state";

export default function ProjectsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorState
      reset={reset}
      title="Projects unavailable"
      description="The projects surface failed to render. Reset this route and the rest of the application will stay intact."
      href="/dashboard"
      hrefLabel="Back to dashboard"
    />
  );
}
