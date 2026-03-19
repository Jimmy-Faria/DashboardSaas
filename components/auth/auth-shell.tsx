import Link from "next/link";
import { Layers } from "lucide-react";

interface AuthShellProps {
  title: string;
  description: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}

export function AuthShell({
  title,
  description,
  footer,
  children,
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0">
        <div className="absolute left-[10%] top-[15%] h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-[8%] top-[22%] h-80 w-80 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute bottom-[8%] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-success/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md rounded-[2rem] border border-border/60 bg-card/80 p-8 shadow-2xl backdrop-blur-2xl">
          <div className="mb-8 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
                <Layers className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-lg font-semibold tracking-tight">ProjectFlow</p>
                <p className="text-sm text-muted-foreground">MVP workspace</p>
              </div>
            </Link>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
              <p className="text-muted-foreground">{description}</p>
            </div>
          </div>

          {children}

          <div className="mt-8 text-sm text-muted-foreground">{footer}</div>
        </div>
      </div>
    </div>
  );
}
