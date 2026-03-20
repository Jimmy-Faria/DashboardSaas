"use client";

import { RouteErrorState } from "@/components/layout/route-error-state";

export default function ProjectDetailError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorState
      reset={reset}
      title="Project view unavailable"
      description="This project board hit an unexpected error. Reset the route or go back to the projects index."
      href="/projects"
      hrefLabel="Back to projects"
    />
  );
}
