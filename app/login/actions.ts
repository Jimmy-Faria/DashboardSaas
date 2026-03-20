"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const DEMO_EMAIL = "alex@projectflow.app";
const DEMO_PASSWORD = "demo1234";

export async function ensureDemoAccountAction(email: string, password: string) {
  if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
    return { ok: true, ensured: false };
  }

  const admin = createSupabaseAdminClient();

  if (!admin) {
    return { ok: true, ensured: false };
  }

  const { data: existingUsers, error: listError } =
    await admin.auth.admin.listUsers();

  if (listError) {
    throw new Error(listError.message);
  }

  const existingUser = existingUsers.users.find(
    (user) => user.email?.toLowerCase() === DEMO_EMAIL
  );

  let userId = existingUser?.id;

  if (!userId) {
    const { data, error } = await admin.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: "Alex Morgan",
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    userId = data.user?.id;
  }

  if (!userId) {
    throw new Error("Unable to provision the demo account.");
  }

  const { error: profileError } = await admin.from("profiles").upsert({
    id: userId,
    full_name: "Alex Morgan",
    email: DEMO_EMAIL,
    birth_date: null,
    avatar_url: null,
  });

  if (profileError) {
    throw new Error(profileError.message);
  }

  return { ok: true, ensured: true };
}
