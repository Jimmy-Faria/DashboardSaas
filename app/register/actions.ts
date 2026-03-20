"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  getBirthDateValidationError,
  getEmailValidationError,
  getNameValidationError,
  getPasswordValidationError,
  normalizeEmail,
} from "@/lib/auth/validation";

interface CreateAccountInput {
  name: string;
  email: string;
  birthDate: string;
  password: string;
}

interface CreateAccountResult {
  ok: boolean;
  createdWithAdmin: boolean;
  message?: string;
}

export async function createAccountAction(
  input: CreateAccountInput
): Promise<CreateAccountResult> {
  const nameError = getNameValidationError(input.name);
  const emailError = getEmailValidationError(input.email);
  const birthDateError = getBirthDateValidationError(input.birthDate);
  const passwordError = getPasswordValidationError(input.password);
  const validationError =
    nameError || emailError || birthDateError || passwordError;

  if (validationError) {
    throw new Error(validationError);
  }

  const admin = createSupabaseAdminClient();

  if (!admin) {
    return {
      ok: false,
      createdWithAdmin: false,
      message:
        "Signup is blocked by Supabase email limits. Add SUPABASE_SERVICE_ROLE_KEY to .env.local or disable email confirmation in Supabase Auth.",
    };
  }

  const email = normalizeEmail(input.email);
  const name = input.name.trim();

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      full_name: name,
      birth_date: input.birthDate,
    },
  });

  if (error) {
    const message = error.message.toLowerCase();

    if (
      message.includes("already been registered") ||
      message.includes("already registered") ||
      message.includes("already exists")
    ) {
      return {
        ok: true,
        createdWithAdmin: false,
      };
    }

    throw new Error(error.message);
  }

  if (!data.user?.id) {
    throw new Error("Unable to create the account.");
  }

  const { error: profileError } = await admin.from("profiles").upsert({
    id: data.user.id,
    full_name: name,
    email,
    birth_date: input.birthDate,
    avatar_url: null,
  });

  if (profileError) {
    throw new Error(profileError.message);
  }

  return {
    ok: true,
    createdWithAdmin: true,
  };
}
