import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedPageSkeletonProps {
  kind?: "dashboard" | "board" | "grid";
}

export function ProtectedPageSkeleton({
  kind = "dashboard",
}: ProtectedPageSkeletonProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-8 pt-20 sm:px-6 sm:pb-10 sm:pt-24 lg:px-8">
        <div className="space-y-8">
          <div className="space-y-3">
            <Skeleton className="h-10 w-56 rounded-2xl bg-card/60" />
            <Skeleton className="h-5 w-72 rounded-xl bg-card/40" />
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-36 rounded-3xl bg-card/60" />
            ))}
          </div>

          {kind === "board" ? (
            <div className="grid gap-6 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, columnIndex) => (
                <div
                  key={columnIndex}
                  className="rounded-3xl border border-border/50 bg-card/70 p-5"
                >
                  <Skeleton className="mb-5 h-8 w-32 rounded-2xl bg-muted/80" />
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((__, cardIndex) => (
                      <Skeleton
                        key={cardIndex}
                        className="h-28 rounded-2xl bg-background/60"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : kind === "grid" ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-64 rounded-3xl bg-card/60" />
              ))}
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-2">
              <Skeleton className="h-96 rounded-3xl bg-card/60" />
              <Skeleton className="h-96 rounded-3xl bg-card/60" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
