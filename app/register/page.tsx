"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { createAccountAction } from "@/app/register/actions";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PASSWORD_HTML_PATTERN,
  getBirthDateValidationError,
  getEmailValidationError,
  getNameValidationError,
  getPasswordValidationError,
} from "@/lib/auth/validation";
import { registerUser } from "@/lib/supabase/auth";
import { useProjectStore } from "@/store/useProjectStore";

function RegisterPageContent() {
  const router = useRouter();
  const setCurrentUser = useProjectStore((state) => state.setCurrentUser);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nameError = name ? getNameValidationError(name) : null;
  const emailError = email ? getEmailValidationError(email) : null;
  const birthDateError = birthDate ? getBirthDateValidationError(birthDate) : null;
  const passwordError = password ? getPasswordValidationError(password) : null;
  const confirmPasswordError =
    confirmPassword && password !== confirmPassword ? "Passwords do not match." : null;
  const isFormInvalid =
    !name.trim() ||
    !email.trim() ||
    !birthDate.trim() ||
    !password ||
    !confirmPassword ||
    Boolean(nameError || emailError || birthDateError || passwordError || confirmPasswordError);

  const redirectToLogin = (message: string) => {
    setCurrentUser(null);
    toast.success(message);
    router.push(`/login?email=${encodeURIComponent(email.trim().toLowerCase())}`);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (nameError || emailError || birthDateError || passwordError) {
      toast.error(nameError || emailError || birthDateError || passwordError);
      return;
    }

    if (confirmPasswordError) {
      toast.error(confirmPasswordError);
      return;
    }

    setIsSubmitting(true);

    try {
      const serverResult = await createAccountAction({
        name,
        email,
        birthDate,
        password,
      });

      if (serverResult.ok) {
        redirectToLogin("Account created. Sign in to continue.");
        return;
      }

      const result = await registerUser({ name, email, password, birthDate });

      redirectToLogin(
        result.requiresEmailConfirmation
          ? "Account created. Confirm your email before signing in."
          : "Account created. Sign in to continue."
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to create your account."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create account"
      footer={
        <Link
          href="/login"
          className="font-semibold text-zinc-950 transition-colors hover:text-zinc-600"
        >
          Sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold tracking-tight text-zinc-900">
            Full name
          </label>
          <Input
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-invalid={Boolean(nameError)}
            className="h-12 rounded-[1.2rem] border-black/8 bg-white px-4 text-base text-zinc-950 shadow-[0_16px_35px_-30px_rgba(15,23,42,0.28)] transition placeholder:text-zinc-400 focus-visible:border-zinc-500 focus-visible:ring-[3px] focus-visible:ring-zinc-200 dark:border-black/8 dark:bg-white dark:text-zinc-950"
            required
          />
          {nameError ? (
            <p className="text-xs font-medium text-red-600">{nameError}</p>
          ) : null}
        </div>

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
            Birth date
          </label>
          <Input
            type="date"
            value={birthDate}
            onChange={(event) => setBirthDate(event.target.value)}
            aria-invalid={Boolean(birthDateError)}
            className="h-12 rounded-[1.2rem] border-black/8 bg-white px-4 text-base text-zinc-950 shadow-[0_16px_35px_-30px_rgba(15,23,42,0.28)] transition focus-visible:border-zinc-500 focus-visible:ring-[3px] focus-visible:ring-zinc-200 dark:border-black/8 dark:bg-white dark:text-zinc-950"
            required
          />
          {birthDateError ? (
            <p className="text-xs font-medium text-red-600">
              {birthDateError}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold tracking-tight text-zinc-900">
            Password
          </label>
          <Input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            pattern={PASSWORD_HTML_PATTERN}
            title="Use at least 8 characters with letters and numbers."
            aria-invalid={Boolean(passwordError)}
            className="h-12 rounded-[1.2rem] border-black/8 bg-white px-4 text-base text-zinc-950 shadow-[0_16px_35px_-30px_rgba(15,23,42,0.28)] transition placeholder:text-zinc-400 focus-visible:border-zinc-500 focus-visible:ring-[3px] focus-visible:ring-zinc-200 dark:border-black/8 dark:bg-white dark:text-zinc-950"
            required
          />
          <p className="text-xs text-zinc-500">
            Use at least 8 characters with letters and numbers.
          </p>
          {passwordError ? (
            <p className="text-xs font-medium text-red-600">
              {passwordError}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold tracking-tight text-zinc-900">
            Confirm password
          </label>
          <Input
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            aria-invalid={Boolean(confirmPasswordError)}
            className="h-12 rounded-[1.2rem] border-black/8 bg-white px-4 text-base text-zinc-950 shadow-[0_16px_35px_-30px_rgba(15,23,42,0.28)] transition placeholder:text-zinc-400 focus-visible:border-zinc-500 focus-visible:ring-[3px] focus-visible:ring-zinc-200 dark:border-black/8 dark:bg-white dark:text-zinc-950"
            required
          />
          {confirmPasswordError ? (
            <p className="text-xs font-medium text-red-600">
              {confirmPasswordError}
            </p>
          ) : null}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || isFormInvalid}
          className="group h-12 w-full rounded-[1.25rem] bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-700 text-base font-semibold text-white shadow-[0_24px_55px_-24px_rgba(15,23,42,0.42)] transition hover:-translate-y-0.5 hover:from-black hover:to-zinc-800 hover:shadow-[0_30px_65px_-24px_rgba(15,23,42,0.48)] disabled:translate-y-0 disabled:from-zinc-300 disabled:via-zinc-300 disabled:to-zinc-300 disabled:text-zinc-600 disabled:shadow-none"
        >
          {isSubmitting ? "Creating..." : "Create account"}
          {!isSubmitting && (
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          )}
        </Button>
      </form>
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <RegisterPageContent />
    </Suspense>
  );
}
