"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getDemoCredentials, loginMockUser } from "@/lib/mock-auth";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { useProjectStore } from "@/store/useProjectStore";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasMounted = useHasMounted();
  const currentUser = useProjectStore((state) => state.currentUser);
  const hasHydrated = useProjectStore((state) => state.hasHydrated);
  const setCurrentUser = useProjectStore((state) => state.setCurrentUser);
  const [email, setEmail] = useState(getDemoCredentials().email);
  const [password, setPassword] = useState(getDemoCredentials().password);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (hasMounted && hasHydrated && currentUser) {
      router.replace("/dashboard");
    }
  }, [currentUser, hasHydrated, hasMounted, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const user = loginMockUser({ email, password });
      setCurrentUser(user);
      toast.success("Welcome back");
      router.push(searchParams.get("next") || "/dashboard");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to sign you in.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to continue managing projects, metrics, and task flow."
      footer={
        <p>
          Do not have an account yet?{" "}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Create one
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Email</label>
          <Input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-12 rounded-2xl border-border/60 bg-background/50"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Password</label>
          <Input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-12 rounded-2xl border-border/60 bg-background/50"
            required
          />
        </div>

        <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 text-sm text-muted-foreground">
          Demo account: <span className="font-semibold text-foreground">{getDemoCredentials().email}</span>
          {" / "}
          <span className="font-semibold text-foreground">{getDemoCredentials().password}</span>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full rounded-2xl bg-gradient-to-r from-primary to-accent text-base font-semibold shadow-lg shadow-primary/30"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
          {!isSubmitting && <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>
    </AuthShell>
  );
}
