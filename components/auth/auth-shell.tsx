import Link from "next/link";
import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthShellProps {
  title: string;
  description?: string;
  panelClassName?: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}

export function AuthShell({
  title,
  description,
  panelClassName,
  footer,
  children,
}: AuthShellProps) {
  return (
    <div className="auth-shell relative min-h-screen overflow-hidden bg-white text-zinc-950">
      <div className="area">
        <ul className="circles">
          {Array.from({ length: 10 }).map((_, index) => (
            <li key={index} />
          ))}
        </ul>
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-5 sm:px-6">
        <div className={cn("w-full max-w-[31rem]", panelClassName)}>
          <div className="relative overflow-hidden rounded-[2rem] border border-black/8 bg-white p-5 shadow-[0_34px_90px_-46px_rgba(15,23,42,0.22)] sm:p-7">
            <div className="absolute inset-x-16 top-0 h-px bg-gradient-to-r from-transparent via-zinc-300/35 to-transparent" />

            <div className="relative mb-7 text-center sm:mb-8">
              <Link href="/" className="inline-flex flex-col items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-zinc-950 text-white shadow-[0_20px_40px_-22px_rgba(15,23,42,0.45)]">
                  <Layers className="h-4.5 w-4.5" />
                </div>

                <p className="text-lg font-semibold tracking-tight text-zinc-950">
                  ProjectFlow
                </p>
              </Link>

              <div className="mt-5 space-y-2">
                <h1 className="text-3xl font-semibold tracking-[-0.04em] text-zinc-950 sm:text-[3rem]">
                  {title}
                </h1>
                {description ? (
                  <p className="mx-auto max-w-md text-sm leading-6 text-zinc-600">
                    {description}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="relative">{children}</div>

            <div className="relative mt-6 border-t border-black/8 pt-5 text-center text-sm text-zinc-600">
              {footer}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
