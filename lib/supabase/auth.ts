import type { Session, User } from "@supabase/supabase-js";
import {
  getBirthDateValidationError,
  getEmailValidationError,
  getNameValidationError,
  getOptionalBirthDateValidationError,
  getOptionalPasswordValidationError,
  getPasswordValidationError,
  normalizeEmail,
} from "@/lib/auth/validation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { DatabaseProfileRow } from "@/lib/supabase/records";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  avatarFallback: string;
  birthDate?: string;
  language: "en" | "pt";
}

interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
  birthDate: string;
}

interface LoginUserInput {
  email: string;
  password: string;
}

interface UpdateUserProfileInput {
  name?: string;
  email?: string;
  password?: string;
  avatarUrl?: string;
  birthDate?: string;
  language?: "en" | "pt";
}

const getInitials = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

const isSupabaseError = (
  error: unknown
): error is {
  message?: string;
} => typeof error === "object" && error !== null;

const getAuthErrorMessage = (error: unknown) => {
  const message = isSupabaseError(error) ? error.message?.trim() || "" : "";
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("invalid login credentials") ||
    normalizedMessage.includes("invalid email or password")
  ) {
    return "Invalid email or password. If you just created an account, confirm your email first.";
  }

  if (normalizedMessage.includes("email not confirmed")) {
    return "Confirm your email before signing in.";
  }

  if (normalizedMessage.includes("user already registered")) {
    return "This email already has an account. Sign in instead.";
  }

  if (normalizedMessage.includes("email rate limit exceeded")) {
    return "Too many email requests. Wait a minute, or sign in if the account already exists.";
  }

  return message || "Authentication failed.";
};

const isExistingAccountError = (error: unknown) =>
  getAuthErrorMessage(error) === "This email already has an account. Sign in instead.";

const isEmailRateLimitError = (error: unknown) =>
  getAuthErrorMessage(error) ===
  "Too many email requests. Wait a minute, or sign in if the account already exists.";

const toSessionUser = (
  user: User | null,
  profile?: DatabaseProfileRow | null,
  language: SessionUser["language"] = "en"
): SessionUser | null => {
  if (!user?.email) {
    return null;
  }

  const name =
    profile?.full_name?.trim() ||
    user.user_metadata?.full_name?.trim() ||
    user.email.split("@")[0] ||
    "ProjectFlow";
  const email = profile?.email?.trim() || user.email;

  return {
    id: user.id,
    name,
    email,
    avatarUrl: profile?.avatar_url?.trim() || undefined,
    avatarFallback: getInitials(name),
    birthDate: profile?.birth_date || undefined,
    language,
  };
};

const fetchProfile = async (userId: string) => {
  const client = getSupabaseBrowserClient();

  if (!client) {
    return null;
  }

  const { data, error } = await client
    .from("profiles")
    .select("id, full_name, email, birth_date, avatar_url")
    .eq("id", userId)
    .maybeSingle<DatabaseProfileRow>();

  if (error) {
    throw error;
  }

  return data ?? null;
};

const upsertProfile = async (payload: DatabaseProfileRow) => {
  const client = getSupabaseBrowserClient();

  if (!client) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await client.from("profiles").upsert(payload);

  if (error) {
    throw error;
  }
};

const ensureProfile = async (user: User, birthDate?: string) => {
  const existingProfile = await fetchProfile(user.id);

  if (existingProfile) {
    return existingProfile;
  }

  const profile: DatabaseProfileRow = {
    id: user.id,
    full_name:
      user.user_metadata?.full_name?.trim() ||
      user.email?.split("@")[0] ||
      "ProjectFlow",
    email: user.email ?? null,
    birth_date:
      birthDate || user.user_metadata?.birth_date?.trim() || null,
    avatar_url: user.user_metadata?.avatar_url?.trim() || null,
  };

  await upsertProfile(profile);
  return profile;
};

const resolveSessionProfile = async (user: User, birthDate?: string) => {
  try {
    return await ensureProfile(user, birthDate);
  } catch (error) {
    console.warn("Unable to sync profile from Supabase, using auth metadata.", error);
    return {
      id: user.id,
      full_name:
        user.user_metadata?.full_name?.trim() ||
        user.email?.split("@")[0] ||
        "ProjectFlow",
      email: user.email ?? null,
      birth_date: birthDate || user.user_metadata?.birth_date?.trim() || null,
      avatar_url: user.user_metadata?.avatar_url?.trim() || null,
    } satisfies DatabaseProfileRow;
  }
};

const signInExistingUser = async (email: string, password: string) => {
  const client = getSupabaseBrowserClient();

  if (!client) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return null;
  }

  const profile = data.user ? await resolveSessionProfile(data.user) : null;
  return toSessionUser(data.user, profile);
};

const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string
) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
};

export const restoreSessionUser = async () => {
  const client = getSupabaseBrowserClient();

  if (!client) {
    return null;
  }

  const {
    data: { session },
    error,
  } = await client.auth.getSession();

  if (error || !session?.user) {
    return null;
  }

  const profile = await resolveSessionProfile(session.user);
  return toSessionUser(session.user, profile);
};

export const registerUser = async ({
  name,
  email,
  password,
  birthDate,
}: RegisterUserInput) => {
  const client = getSupabaseBrowserClient();

  if (!client) {
    throw new Error("Supabase is not configured.");
  }

  const nameError = getNameValidationError(name);
  const emailError = getEmailValidationError(email);
  const birthDateError = getBirthDateValidationError(birthDate);
  const passwordError = getPasswordValidationError(password);
  const registrationError =
    nameError || emailError || birthDateError || passwordError;

  if (registrationError) {
    throw new Error(registrationError);
  }

  const normalizedEmail = normalizeEmail(email);
  const normalizedName = name.trim();

  const { data, error } = await client.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      emailRedirectTo:
        typeof window !== "undefined" ? `${window.location.origin}/login` : undefined,
      data: {
        full_name: normalizedName,
        birth_date: birthDate,
      },
    },
  });

  if (error) {
    if (isExistingAccountError(error) || isEmailRateLimitError(error)) {
      const existingUser = await signInExistingUser(normalizedEmail, password);

      if (existingUser) {
        return {
          user: existingUser,
          requiresEmailConfirmation: false,
        };
      }
    }

    throw new Error(getAuthErrorMessage(error));
  }

  if (data.user && data.session) {
    await upsertProfile({
      id: data.user.id,
      full_name: normalizedName,
      email: normalizedEmail,
      birth_date: birthDate,
      avatar_url: null,
    });
  }

  return {
    user:
      data.user && data.session
        ? toSessionUser(data.user, await resolveSessionProfile(data.user, birthDate))
        : null,
    requiresEmailConfirmation: !data.session,
  };
};

export const loginUser = async ({ email, password }: LoginUserInput) => {
  const client = getSupabaseBrowserClient();

  if (!client) {
    throw new Error("Supabase is not configured.");
  }

  const emailError = getEmailValidationError(email);

  if (emailError) {
    throw new Error(emailError);
  }

  const { data, error } = await withTimeout(
    client.auth.signInWithPassword({
      email: normalizeEmail(email),
      password,
    }),
    12000,
    "Sign in took too long. Try again."
  );

  if (error) {
    throw new Error(getAuthErrorMessage(error));
  }

  return toSessionUser(data.user, null);
};

export const logoutUser = async () => {
  const client = getSupabaseBrowserClient();

  if (!client) {
    return;
  }

  await client.auth.signOut();
};

export const updateSupabaseUserProfile = async ({
  name,
  email,
  password,
  avatarUrl,
  birthDate,
  language = "en",
}: UpdateUserProfileInput) => {
  const client = getSupabaseBrowserClient();

  if (!client) {
    throw new Error("Supabase is not configured.");
  }

  const nameError = name ? getNameValidationError(name) : null;
  const emailError = email ? getEmailValidationError(email) : null;
  const birthDateError =
    typeof birthDate === "string"
      ? getOptionalBirthDateValidationError(birthDate)
      : null;
  const passwordError = getOptionalPasswordValidationError(password ?? "");
  const profileError =
    nameError || emailError || birthDateError || passwordError;

  if (profileError) {
    throw new Error(profileError);
  }

  const {
    data: { user: currentUser },
    error: currentUserError,
  } = await client.auth.getUser();

  if (currentUserError || !currentUser?.email) {
    throw currentUserError ?? new Error("No active session.");
  }

  const nextEmail = email ? normalizeEmail(email) : currentUser.email;
  const nextName = name?.trim() || currentUser.email.split("@")[0];

  const { data, error } = await client.auth.updateUser({
    email: nextEmail,
    password: password?.trim() ? password : undefined,
    data: {
      full_name: nextName,
    },
  });

  if (error) {
    throw new Error(getAuthErrorMessage(error));
  }

  const profile: DatabaseProfileRow = {
    id: currentUser.id,
    full_name: nextName,
    email: nextEmail,
    birth_date: typeof birthDate === "string" ? birthDate || null : null,
    avatar_url:
      typeof avatarUrl === "string" ? avatarUrl.trim() || null : null,
  };

  await upsertProfile(profile);
  const sessionUser = toSessionUser(data.user ?? currentUser, profile, language);

  if (!sessionUser) {
    throw new Error("Unable to refresh the session profile.");
  }

  return sessionUser;
};

export const subscribeToAuthChanges = (
  callback: (event: string, user: SessionUser | null) => void
) => {
  const client = getSupabaseBrowserClient();

  if (!client) {
    return () => {};
  }

  const {
    data: { subscription },
  } = client.auth.onAuthStateChange((event: string, session: Session | null) => {
    const authUser = session?.user ?? null;
    const fallbackUser = toSessionUser(authUser, null);

    // Avoid awaiting Supabase calls inside the auth callback lock.
    setTimeout(() => {
      if (!authUser) {
        callback(event, null);
        return;
      }

      void resolveSessionProfile(authUser)
        .then((profile) => {
          callback(event, toSessionUser(authUser, profile));
        })
        .catch((error) => {
          console.warn("Unable to resolve the auth profile during session sync.", error);
          callback(event, fallbackUser);
        });
    }, 0);
  });

  return () => subscription.unsubscribe();
};
