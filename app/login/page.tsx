"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { ensureDemoAccountAction } from "@/app/login/actions";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getEmailValidationError } from "@/lib/auth/validation";
import { loginUser } from "@/lib/supabase/auth";
import { useProjectStore } from "@/store/useProjectStore";

const DEMO_EMAIL = "alex@projectflow.app";
const DEMO_PASSWORD = "demo1234";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setCurrentUser = useProjectStore((state) => state.setCurrentUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailError = email ? getEmailValidationError(email) : null;
  const isFormInvalid = !email.trim() || !password || Boolean(emailError);

  useEffect(() => {
    const prefetchedEmail = searchParams.get("email");

    if (prefetchedEmail) {
      setEmail(prefetchedEmail);
    }
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (emailError) {
      toast.error(emailError);
      return;
    }

    setIsSubmitting(true);

    try {
      if (email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
        await ensureDemoAccountAction(email, password);
      }
      const user = await loginUser({ email, password });
      setCurrentUser(user);
      toast.success("Signed in");
      router.replace(searchParams.get("next") || "/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to sign you in."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Sign in"
      footer={
        <Link
          href="/register"
          className="font-semibold text-zinc-950 transition-colors hover:text-zinc-600"
        >
          Create account
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold tracking-tight text-zinc-900">
            Email
          </label>
          <Input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            inputMode="email"
            spellCheck={false}
            autoCapitalize="none"
            aria-invalid={Boolean(emailError)}
            className="h-12 rounded-[1.2rem] border-black/8 bg-white px-4 text-base text-zinc-950 shadow-[0_16px_35px_-30px_rgba(15,23,42,0.28)] transition placeholder:text-zinc-400 focus-visible:border-zinc-500 focus-visible:ring-[3px] focus-visible:ring-zinc-200 dark:border-black/8 dark:bg-white dark:text-zinc-950"
            required
          />
          {emailError ? (
            <p className="text-xs font-medium text-red-600">{emailError}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold tracking-tight text-zinc-900">
            Password
          </label>
          <Input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-12 rounded-[1.2rem] border-black/8 bg-white px-4 text-base text-zinc-950 shadow-[0_16px_35px_-30px_rgba(15,23,42,0.28)] transition placeholder:text-zinc-400 focus-visible:border-zinc-500 focus-visible:ring-[3px] focus-visible:ring-zinc-200 dark:border-black/8 dark:bg-white dark:text-zinc-950"
            required
          />
        </div>
        <Button
          type="submit"
          disabled={isSubmitting || isFormInvalid}
          className="group h-12 w-full rounded-[1.25rem] bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-700 text-base font-semibold text-white shadow-[0_24px_55px_-24px_rgba(15,23,42,0.42)] transition hover:-translate-y-0.5 hover:from-black hover:to-zinc-800 hover:shadow-[0_30px_65px_-24px_rgba(15,23,42,0.48)] disabled:translate-y-0 disabled:from-zinc-300 disabled:via-zinc-300 disabled:to-zinc-300 disabled:text-zinc-600 disabled:shadow-none"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
          {!isSubmitting && (
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          )}
        </Button>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginPageContent />
    </Suspense>
  );
}
