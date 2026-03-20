import { getSupabaseBrowserClient } from "./client";
import type {
  Folder,
  Project,
  ProjectTask,
  Workspace,
  WorkspaceMember,
} from "@/store/useProjectStore";

const safeUpsert = async (table: string, payload: object | object[]) => {
  const client = getSupabaseBrowserClient();

  if (!client) {
    return;
  }

  await client.from(table).upsert(payload).throwOnError();
};

export const syncWorkspaceSnapshot = async ({
  workspace,
  folders,
  members,
  projects,
  tasks,
}: {
  workspace: Workspace;
  folders: Folder[];
  members: WorkspaceMember[];
  projects: Project[];
  tasks: ProjectTask[];
}) => {
  await Promise.all([
    safeUpsert("workspaces", workspace),
    safeUpsert("workspace_members", members),
    safeUpsert("folders", folders),
    safeUpsert("projects", projects),
    safeUpsert("tasks", tasks),
  ]);
};
