import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  mapDatabaseFolderToStoreFolder,
  mapDatabaseProjectToStoreProject,
  mapDatabaseTaskToStoreTask,
  mapDatabaseWorkspaceToStoreWorkspace,
  mapStoreProjectToDatabaseProject,
  mapStoreTaskToDatabaseTask,
  type DatabaseFolderRow,
  type DatabaseMessageRow,
  type DatabaseProfileRow,
  type DatabaseProjectRow,
  type DatabaseTaskRow,
  type DatabaseWorkspaceRow,
} from "@/lib/supabase/records";
import type {
  Folder,
  Project,
  ProjectTask,
  ProjectViewMode,
  Workspace,
  WorkspaceMember,
} from "@/store/useProjectStore";

const DEFAULT_WORKSPACE_NAME = "ProjectFlow";
const DEFAULT_FOLDER_NAMES = ["General", "Product", "Operations"];
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface ProjectChatMessage {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  body: string;
  createdAt: string;
}

export interface RemoteWorkspaceSnapshot {
  workspace?: Partial<Workspace>;
  members?: Partial<WorkspaceMember>[];
  folders?: Partial<Folder>[];
  projects?: Partial<Project>[];
  tasks?: Partial<ProjectTask>[];
  projectViews?: Record<string, ProjectViewMode>;
}

const getInitials = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

const buildProfileMember = (
  profile: DatabaseProfileRow,
  index: number,
  currentUserId: string
): WorkspaceMember => ({
  id: profile.id,
  userId: profile.id,
  name: profile.full_name?.trim() || profile.email?.split("@")[0] || "ProjectFlow",
  email: profile.email?.trim().toLowerCase() || `user-${index + 1}@projectflow.app`,
  avatarUrl: profile.avatar_url?.trim() || undefined,
  avatarFallback: getInitials(
    profile.full_name?.trim() || profile.email?.split("@")[0] || "PF"
  ),
  role: profile.id === currentUserId ? "owner" : "member",
  color: [
    "bg-primary/15 text-primary",
    "bg-warning/15 text-warning",
    "bg-success/15 text-success",
    "bg-accent/15 text-accent",
    "bg-muted text-muted-foreground",
  ][index % 5],
});

const ensureWorkspace = async (userId: string) => {
  const client = getSupabaseBrowserClient();

  if (!client) {
    throw new Error("Supabase is not configured.");
  }

  const { data: existingWorkspaces, error: workspacesError } = await client
    .from("workspaces")
    .select("id, name, owner_id, created_at")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true })
    .returns<DatabaseWorkspaceRow[]>();

  if (workspacesError) {
    throw workspacesError;
  }

  if ((existingWorkspaces ?? []).length > 0) {
    return existingWorkspaces?.[0] ?? null;
  }

  const { data, error } = await client
    .from("workspaces")
    .insert({
      owner_id: userId,
      name: DEFAULT_WORKSPACE_NAME,
    })
    .select("id, name, owner_id, created_at")
    .single<DatabaseWorkspaceRow>();

  if (error) {
    throw error;
  }

  return data;
};

const ensureFolders = async (workspaceId: string) => {
  const client = getSupabaseBrowserClient();

  if (!client) {
    throw new Error("Supabase is not configured.");
  }

  const { data: existingFolders, error: foldersError } = await client
    .from("folders")
    .select("id, workspace_id, name, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true })
    .returns<DatabaseFolderRow[]>();

  if (foldersError) {
    throw foldersError;
  }

  if ((existingFolders ?? []).length > 0) {
    return existingFolders ?? [];
  }

  const { data, error } = await client
    .from("folders")
    .insert(DEFAULT_FOLDER_NAMES.map((name) => ({ workspace_id: workspaceId, name })))
    .select("id, workspace_id, name, created_at")
    .returns<DatabaseFolderRow[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
};

const matchFolderByName = (
  folders: DatabaseFolderRow[],
  name?: string | null
) =>
  folders.find(
    (folder) => folder.name.trim().toLowerCase() === name?.trim().toLowerCase()
  );

export const loadRemoteProjectflowState = async () => {
  const client = getSupabaseBrowserClient();

  if (!client) {
    return null;
  }

  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const workspaceRow = await ensureWorkspace(user.id);
  const [foldersRows, projectsResult, profilesResult] = await Promise.all([
    ensureFolders(workspaceRow.id),
    client
      .from("projects")
      .select(
        "id, user_id, workspace_id, folder_id, name, description, category, status, progress, due_date, created_at"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .returns<DatabaseProjectRow[]>(),
    client
      .from("profiles")
      .select("id, full_name, email, birth_date, avatar_url")
      .returns<DatabaseProfileRow[]>(),
  ]);

  if (projectsResult.error) {
    throw projectsResult.error;
  }

  if (profilesResult.error) {
    throw profilesResult.error;
  }

  const projectRows = projectsResult.data ?? [];
  const projectIds = projectRows.map((project) => project.id);
  const tasksResult =
    projectIds.length > 0
      ? await client
          .from("tasks")
          .select(
            "id, project_id, parent_task_id, title, description, status, priority, due_date, tracked_time_ms, created_at"
          )
          .in("project_id", projectIds)
          .returns<DatabaseTaskRow[]>()
      : { data: [], error: null };

  if (tasksResult.error) {
    throw tasksResult.error;
  }

  const workspace = mapDatabaseWorkspaceToStoreWorkspace(workspaceRow);
  const members = (profilesResult.data ?? []).map((profile, index) =>
    buildProfileMember(profile, index, user.id)
  );

  return {
    workspace: {
      ...workspace,
      memberIds: members.map((member) => member.id),
      defaultProjectView: "board",
    },
    members,
    folders: foldersRows.map((folder, index) =>
      mapDatabaseFolderToStoreFolder(folder, index)
    ),
    projects: projectRows.map((project) => mapDatabaseProjectToStoreProject(project)),
    tasks: (tasksResult.data ?? []).map((task) => mapDatabaseTaskToStoreTask(task)),
    projectViews: {},
  } satisfies RemoteWorkspaceSnapshot;
};

export const saveRemoteProjectflowState = async ({
  userId,
  snapshot,
}: {
  userId: string;
  snapshot: RemoteWorkspaceSnapshot;
}) => {
  const client = getSupabaseBrowserClient();

  if (!client) {
    return;
  }

  const workspaceRow = await ensureWorkspace(userId);

  if (!workspaceRow) {
    return;
  }

  const workspaceId = workspaceRow.id;

  const { error: workspaceError } = await client.from("workspaces").upsert({
    id: workspaceId,
    owner_id: userId,
    name: snapshot.workspace?.name || DEFAULT_WORKSPACE_NAME,
  });

  if (workspaceError) {
    throw workspaceError;
  }

  const localFolders = (snapshot.folders ?? []).filter(
    (folder): folder is Folder => Boolean(folder.id && folder.name)
  );
  const foldersWithValidIds = localFolders.filter((folder) =>
    UUID_PATTERN.test(folder.id)
  );

  if (foldersWithValidIds.length > 0) {
    const { error: foldersUpsertError } = await client.from("folders").upsert(
      foldersWithValidIds.map((folder) => ({
        id: folder.id,
        workspace_id: workspaceId,
        name: folder.name,
      }))
    );

    if (foldersUpsertError) {
      throw foldersUpsertError;
    }
  }

  let ensuredFolders = await ensureFolders(workspaceId);
  const requestedFolderNames = Array.from(
    new Set(
      localFolders
        .map((folder) => folder.name.trim())
        .filter((name): name is string => Boolean(name))
    )
  );
  const missingFolderNames = requestedFolderNames.filter(
    (name) =>
      !ensuredFolders.some(
        (folder) => folder.name.trim().toLowerCase() === name.toLowerCase()
      )
  );

  if (missingFolderNames.length > 0) {
    const { error: foldersError } = await client.from("folders").insert(
      missingFolderNames.map((name) => ({
        workspace_id: workspaceId,
        name,
      }))
    );

    if (foldersError) {
      throw foldersError;
    }

    ensuredFolders = await ensureFolders(workspaceId);
  }
  const localFolderIdMap = new Map<string, string>();

  localFolders.forEach((folder) => {
    if (UUID_PATTERN.test(folder.id)) {
      localFolderIdMap.set(folder.id, folder.id);
      return;
    }

    const matchedFolder = matchFolderByName(ensuredFolders, folder.name);

    if (matchedFolder) {
      localFolderIdMap.set(folder.id, matchedFolder.id);
    }
  });

  const defaultFolderId = ensuredFolders[0]?.id ?? null;
  const projects = (snapshot.projects ?? [])
    .filter(
      (project): project is Project =>
        Boolean(project.id && project.name && UUID_PATTERN.test(project.id))
    )
    .map((project) => {
      const localFolder = localFolders.find((folder) => folder.id === project.folderId);
      const resolvedFolderId =
        ensuredFolders.find((folder) => folder.id === project.folderId)?.id ??
        localFolderIdMap.get(project.folderId) ??
        matchFolderByName(ensuredFolders, localFolder?.name)?.id ??
        defaultFolderId;

      return {
        ...mapStoreProjectToDatabaseProject(project),
        user_id: userId,
        workspace_id: workspaceId,
        folder_id: resolvedFolderId,
      };
    });

  const { data: existingProjects, error: existingProjectsError } = await client
    .from("projects")
    .select("id")
    .eq("user_id", userId)
    .returns<Pick<DatabaseProjectRow, "id">[]>();

  if (existingProjectsError) {
    throw existingProjectsError;
  }

  const nextProjectIds = new Set(projects.map((project) => project.id));
  const projectIdsToDelete = (existingProjects ?? [])
    .filter((project) => !nextProjectIds.has(project.id))
    .map((project) => project.id);

  if (projectIdsToDelete.length > 0) {
    const { error: deleteProjectsError } = await client
      .from("projects")
      .delete()
      .in("id", projectIdsToDelete);

    if (deleteProjectsError) {
      throw deleteProjectsError;
    }
  }

  if (projects.length > 0) {
    const { error: projectsError } = await client.from("projects").upsert(projects);

    if (projectsError) {
      throw projectsError;
    }
  }

  const tasks = (snapshot.tasks ?? []).filter(
    (task): task is ProjectTask =>
      Boolean(
        task.id &&
          task.projectId &&
          task.title &&
          UUID_PATTERN.test(task.projectId) &&
          nextProjectIds.has(task.projectId)
      )
  );
  const projectIds = Array.from(nextProjectIds);

  if (projectIds.length > 0) {
    const { data: existingTasks, error: existingTasksError } = await client
      .from("tasks")
      .select("id, project_id")
      .in("project_id", projectIds);

    if (existingTasksError) {
      throw existingTasksError;
    }

    const nextTaskIds = new Set(tasks.map((task) => task.id));
    const taskIdsToDelete = (existingTasks ?? [])
      .filter((task) => !nextTaskIds.has(task.id))
      .map((task) => task.id);

    if (taskIdsToDelete.length > 0) {
      const { error: deleteTasksError } = await client
        .from("tasks")
        .delete()
        .in("id", taskIdsToDelete);

      if (deleteTasksError) {
        throw deleteTasksError;
      }
    }
  }

  if (tasks.length > 0) {
    const { error: tasksError } = await client
      .from("tasks")
      .upsert(tasks.map((task) => mapStoreTaskToDatabaseTask(task)));

    if (tasksError) {
      throw tasksError;
    }
  }
};

export const loadProjectChatMessages = async ({
  projectId,
}: {
  projectId: string;
}) => {
  const client = getSupabaseBrowserClient();

  if (!client) {
    return [] as ProjectChatMessage[];
  }

  const { data: messages, error } = await client
    .from("messages")
    .select("id, project_id, sender_id, content, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true })
    .returns<DatabaseMessageRow[]>();

  if (error) {
    throw error;
  }

  const senderIds = Array.from(new Set((messages ?? []).map((message) => message.sender_id)));
  const profilesResult =
    senderIds.length > 0
      ? await client
          .from("profiles")
          .select("id, full_name, email, birth_date, avatar_url")
          .in("id", senderIds)
          .returns<DatabaseProfileRow[]>()
      : { data: [], error: null };

  if (profilesResult.error) {
    throw profilesResult.error;
  }

  const profilesById = new Map(
    (profilesResult.data ?? []).map((profile) => [profile.id, profile])
  );

  return (messages ?? []).map((message) => {
    const senderProfile = profilesById.get(message.sender_id);
    return {
      id: message.id,
      projectId: message.project_id,
      userId: message.sender_id,
      userName:
        senderProfile?.full_name?.trim() ||
        senderProfile?.email?.split("@")[0] ||
        "ProjectFlow",
      userAvatarUrl: senderProfile?.avatar_url?.trim() || undefined,
      body: message.content,
      createdAt: message.created_at ?? new Date().toISOString(),
    };
  });
};

export const insertProjectChatMessage = async ({
  projectId,
  userId,
  body,
}: {
  projectId: string;
  userId: string;
  body: string;
}) => {
  const client = getSupabaseBrowserClient();

  if (!client) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await client
    .from("messages")
    .insert({
      project_id: projectId,
      sender_id: userId,
      content: body.trim(),
    })
    .select("id, project_id, sender_id, content, created_at")
    .single<DatabaseMessageRow>();

  if (error) {
    throw error;
  }

  const { data: profile } = await client
    .from("profiles")
    .select("id, full_name, email, birth_date, avatar_url")
    .eq("id", userId)
    .maybeSingle<DatabaseProfileRow>();

  return {
    id: data.id,
    projectId: data.project_id,
    userId: data.sender_id,
    userName:
      profile?.full_name?.trim() || profile?.email?.split("@")[0] || "ProjectFlow",
    userAvatarUrl: profile?.avatar_url?.trim() || undefined,
    body: data.content,
    createdAt: data.created_at ?? new Date().toISOString(),
  } satisfies ProjectChatMessage;
};

export const parseProjectChatMessage = (
  row: Partial<DatabaseMessageRow>
): ProjectChatMessage | null => {
  if (!row.id || !row.project_id || !row.sender_id || !row.content) {
    return null;
  }

  return {
    id: row.id,
    projectId: row.project_id,
    userId: row.sender_id,
    userName: "ProjectFlow",
    body: row.content,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
};
