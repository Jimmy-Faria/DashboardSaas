"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerMockUser } from "@/lib/mock-auth";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { useProjectStore } from "@/store/useProjectStore";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasMounted = useHasMounted();
  const currentUser = useProjectStore((state) => state.currentUser);
  const hasHydrated = useProjectStore((state) => state.hasHydrated);
  const setCurrentUser = useProjectStore((state) => state.setCurrentUser);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (hasMounted && hasHydrated && currentUser) {
      router.replace("/dashboard");
    }
  }, [currentUser, hasHydrated, hasMounted, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const user = registerMockUser({ name, email, password });
      setCurrentUser(user);
      toast.success("Account created");
      router.push(searchParams.get("next") || "/dashboard");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to create your account.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      description="Set up a workspace identity so the dashboard, sidebar, and boards stay personalized."
      footer={
        <p>
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Full name</label>
          <Input
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-12 rounded-2xl border-border/60 bg-background/50"
            required
          />
        </div>

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
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-12 rounded-2xl border-border/60 bg-background/50"
            minLength={6}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Confirm password</label>
          <Input
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="h-12 rounded-2xl border-border/60 bg-background/50"
            minLength={6}
            required
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full rounded-2xl bg-gradient-to-r from-primary to-accent text-base font-semibold shadow-lg shadow-primary/30"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
          {!isSubmitting && <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>
    </AuthShell>
  );
}
