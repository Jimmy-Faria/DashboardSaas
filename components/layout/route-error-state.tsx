"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";

interface RouteErrorStateProps {
  title: string;
  description: string;
  reset: () => void;
  href?: string;
  hrefLabel?: string;
}

export function RouteErrorState({
  title,
  description,
  reset,
  href = "/dashboard",
  hrefLabel = "Back to dashboard",
}: RouteErrorStateProps) {
  return (
    <AppLayout>
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="w-full max-w-xl rounded-[2rem] border border-border/70 bg-card/90 p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-3 text-muted-foreground">{description}</p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button onClick={reset} className="rounded-2xl">
              <RefreshCcw className="h-4 w-4" />
              Try again
            </Button>
            <Button asChild variant="outline" className="rounded-2xl">
              <Link href={href}>{hrefLabel}</Link>
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
