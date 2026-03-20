"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  projectStatusToDatabaseStatus,
  type DatabaseProjectRow,
} from "@/lib/supabase/records";
import type { ProjectStatus } from "@/store/useProjectStore";

export interface ProjectActionInput {
  workspaceId: string;
  folderId: string;
  name: string;
  description: string;
  category: string;
  status: ProjectStatus;
  progress: number;
  dueDate: string;
}

const clampProgress = (value: number) =>
  Math.min(100, Math.max(0, Math.round(value)));

const isUuid = (value?: string | null) =>
  Boolean(
    value &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value
      )
  );

const requireUser = async () => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw error ?? new Error("Unauthorized");
  }

  return { supabase, user };
};

const resolveWorkspaceAndFolder = async ({
  supabase,
  userId,
  workspaceId,
  folderId,
}: {
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  userId: string;
  workspaceId?: string | null;
  folderId?: string | null;
}) => {
  const { data: workspaces, error: workspaceError } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true });

  if (workspaceError) {
    throw new Error(workspaceError.message);
  }

  const preferredWorkspaceId = isUuid(workspaceId) ? workspaceId : null;
  const resolvedWorkspaceId =
    workspaces?.find((workspace) => workspace.id === preferredWorkspaceId)?.id ??
    workspaces?.[0]?.id ??
    null;

  if (!resolvedWorkspaceId) {
    throw new Error("Workspace not found.");
  }

  const { data: folders, error: foldersError } = await supabase
    .from("folders")
    .select("id")
    .eq("workspace_id", resolvedWorkspaceId)
    .order("created_at", { ascending: true });

  if (foldersError) {
    throw new Error(foldersError.message);
  }

  const preferredFolderId = isUuid(folderId) ? folderId : null;
  const resolvedFolderId =
    folders?.find((folder) => folder.id === preferredFolderId)?.id ??
    folders?.[0]?.id ??
    null;

  return {
    workspaceId: resolvedWorkspaceId,
    folderId: resolvedFolderId,
  };
};

const revalidateProjectRoutes = (projectId?: string) => {
  revalidatePath("/dashboard");
  revalidatePath("/projects");

  if (projectId) {
    revalidatePath(`/projects/${projectId}`);
  }
};

export async function createProjectAction(input: ProjectActionInput) {
  const { supabase, user } = await requireUser();
  const resolvedIds = await resolveWorkspaceAndFolder({
    supabase,
    userId: user.id,
    workspaceId: input.workspaceId,
    folderId: input.folderId,
  });

  const payload = {
    user_id: user.id,
    workspace_id: resolvedIds.workspaceId,
    folder_id: resolvedIds.folderId,
    name: input.name.trim(),
    description: input.description.trim() || null,
    category: input.category.trim() || "General",
    status: projectStatusToDatabaseStatus(input.status),
    progress: clampProgress(input.progress),
    due_date: input.dueDate,
  };

  const { data, error } = await supabase
    .from("projects")
    .insert(payload)
    .select(
      "id, user_id, workspace_id, folder_id, name, description, category, status, progress, due_date, created_at"
    )
    .single<DatabaseProjectRow>();

  if (error) {
    throw new Error(error.message);
  }

  revalidateProjectRoutes(data.id);
  return data;
}

export async function updateProjectAction(
  projectId: string,
  input: ProjectActionInput
) {
  const { supabase, user } = await requireUser();
  const resolvedIds = await resolveWorkspaceAndFolder({
    supabase,
    userId: user.id,
    workspaceId: input.workspaceId,
    folderId: input.folderId,
  });

  const payload = {
    workspace_id: resolvedIds.workspaceId,
    folder_id: resolvedIds.folderId,
    name: input.name.trim(),
    description: input.description.trim() || null,
    category: input.category.trim() || "General",
    status: projectStatusToDatabaseStatus(input.status),
    progress: clampProgress(input.progress),
    due_date: input.dueDate,
  };

  const { data, error } = await supabase
    .from("projects")
    .update(payload)
    .eq("id", projectId)
    .eq("user_id", user.id)
    .select(
      "id, user_id, workspace_id, folder_id, name, description, category, status, progress, due_date, created_at"
    )
    .single<DatabaseProjectRow>();

  if (error) {
    throw new Error(error.message);
  }

  revalidateProjectRoutes(projectId);
  return data;
}

export async function deleteProjectAction(projectId: string) {
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidateProjectRoutes(projectId);
  return { success: true, id: projectId };
}
