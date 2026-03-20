"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { DatabaseProfileRow } from "@/lib/supabase/records";

export async function listProfilesAction() {
  const admin = createSupabaseAdminClient();

  if (!admin) {
    return [] as DatabaseProfileRow[];
  }

  const { data, error } = await admin
    .from("profiles")
    .select("id, full_name, email, birth_date, avatar_url")
    .order("updated_at", { ascending: false })
    .returns<DatabaseProfileRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
