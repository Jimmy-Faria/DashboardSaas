import type {
  Folder,
  Project,
  ProjectStatus,
  ProjectTask,
  TaskPriority,
  TaskStatus,
  Workspace,
} from "@/store/useProjectStore";

export interface DatabaseProfileRow {
  id: string;
  full_name: string | null;
  email: string | null;
  birth_date: string | null;
  avatar_url: string | null;
}

export interface DatabaseWorkspaceRow {
  id: string;
  name: string;
  owner_id: string;
  created_at: string | null;
}

export interface DatabaseFolderRow {
  id: string;
  workspace_id: string;
  name: string;
  created_at: string | null;
}

export interface DatabaseProjectRow {
  id: string;
  user_id: string;
  workspace_id: string | null;
  folder_id: string | null;
  name: string;
  description: string | null;
  category: string | null;
  status: string | null;
  progress: number | null;
  due_date: string | null;
  created_at: string | null;
}

export interface DatabaseTaskRow {
  id: string;
  project_id: string;
  parent_task_id: string | null;
  title: string;
  description: string | null;
  status: string | null;
  priority: string | null;
  due_date: string | null;
  tracked_time_ms: number | null;
  created_at: string | null;
}

export interface DatabaseMessageRow {
  id: string;
  project_id: string;
  sender_id: string;
  content: string;
  created_at: string | null;
}

const clampProgress = (value?: number | null) =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.min(100, Math.max(0, Math.round(value)))
    : 0;

export const databaseStatusToProjectStatus = (
  status?: string | null
): ProjectStatus => {
  switch (status) {
    case "Completed":
      return "completed";
    case "On Hold":
      return "on-hold";
    case "Planning":
      return "planning";
    case "Active":
    default:
      return "active";
  }
};

export const projectStatusToDatabaseStatus = (status?: ProjectStatus) => {
  switch (status) {
    case "completed":
      return "Completed";
    case "on-hold":
      return "On Hold";
    case "planning":
      return "Planning";
    case "active":
    default:
      return "Active";
  }
};

export const databaseStatusToTaskStatus = (status?: string | null): TaskStatus => {
  switch (status) {
    case "In Progress":
      return "in-progress";
    case "Review":
      return "review";
    case "Done":
      return "done";
    case "Todo":
    default:
      return "todo";
  }
};

export const taskStatusToDatabaseStatus = (status?: TaskStatus) => {
  switch (status) {
    case "in-progress":
      return "In Progress";
    case "review":
      return "Review";
    case "done":
      return "Done";
    case "todo":
    default:
      return "Todo";
  }
};

export const databasePriorityToTaskPriority = (
  priority?: string | null
): TaskPriority => {
  switch (priority) {
    case "Low":
      return "low";
    case "High":
      return "high";
    case "Medium":
    default:
      return "medium";
  }
};

export const taskPriorityToDatabasePriority = (priority?: TaskPriority) => {
  switch (priority) {
    case "low":
      return "Low";
    case "high":
      return "High";
    case "medium":
    default:
      return "Medium";
  }
};

export const mapDatabaseWorkspaceToStoreWorkspace = (
  row: DatabaseWorkspaceRow
): Partial<Workspace> => ({
  id: row.id,
  name: row.name,
  slug: row.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  createdAt: row.created_at ?? new Date().toISOString(),
  updatedAt: row.created_at ?? new Date().toISOString(),
});

export const mapDatabaseFolderToStoreFolder = (
  row: DatabaseFolderRow,
  index: number
): Partial<Folder> => ({
  id: row.id,
  workspaceId: row.workspace_id,
  name: row.name,
  description: "",
  color: [
    "bg-primary/15 text-primary",
    "bg-warning/15 text-warning",
    "bg-success/15 text-success",
    "bg-accent/15 text-accent",
  ][index % 4],
  createdAt: row.created_at ?? new Date().toISOString(),
  updatedAt: row.created_at ?? new Date().toISOString(),
});

export const mapDatabaseProjectToStoreProject = (
  row: DatabaseProjectRow
): Partial<Project> => ({
  id: row.id,
  userId: row.user_id,
  workspaceId: row.workspace_id ?? "",
  folderId: row.folder_id ?? "",
  name: row.name,
  description: row.description ?? "",
  category: row.category?.trim() || "General",
  progress: clampProgress(row.progress),
  dueDate: row.due_date
    ? new Date(`${row.due_date}T12:00:00`).toISOString()
    : new Date().toISOString(),
  status: databaseStatusToProjectStatus(row.status),
  memberCount: 0,
  assigneeIds: [],
  customFields: {
    priority: "medium",
    tags: row.category?.trim() ? [row.category.trim()] : [],
    budget: null,
  },
  color: "primary",
  createdAt: row.created_at ?? new Date().toISOString(),
  updatedAt: row.created_at ?? new Date().toISOString(),
  syncState: "synced",
  optimistic: false,
});

export const mapStoreProjectToDatabaseProject = (
  project: Project
): Omit<DatabaseProjectRow, "user_id"> => ({
  id: project.id,
  workspace_id: project.workspaceId,
  folder_id: project.folderId,
  name: project.name.trim(),
  description: project.description.trim() || null,
  category: project.category?.trim() || project.customFields.tags[0]?.trim() || "General",
  status: projectStatusToDatabaseStatus(project.status),
  progress: clampProgress(project.progress),
  due_date: project.dueDate ? project.dueDate.slice(0, 10) : null,
  created_at: project.createdAt,
});

export const mapDatabaseTaskToStoreTask = (
  row: DatabaseTaskRow
): Partial<ProjectTask> => ({
  id: row.id,
  projectId: row.project_id,
  parentTaskId: row.parent_task_id ?? null,
  title: row.title,
  description: row.description ?? "",
  priority: databasePriorityToTaskPriority(row.priority),
  status: databaseStatusToTaskStatus(row.status),
  dueDate: row.due_date ?? new Date().toISOString(),
  assigneeIds: [],
  assignee: "",
  trackedTimeMs: row.tracked_time_ms ?? 0,
  timerStartedAt: null,
  timerStartedById: null,
  createdAt: row.created_at ?? new Date().toISOString(),
  updatedAt: row.created_at ?? new Date().toISOString(),
  syncState: "synced",
  optimistic: false,
});

export const mapStoreTaskToDatabaseTask = (task: ProjectTask): DatabaseTaskRow => ({
  id: task.id,
  project_id: task.projectId,
  parent_task_id: task.parentTaskId ?? null,
  title: task.title.trim(),
  description: task.description.trim() || null,
  status: taskStatusToDatabaseStatus(task.status),
  priority: taskPriorityToDatabasePriority(task.priority),
  due_date: task.dueDate || null,
  tracked_time_ms: Math.max(0, Math.round(task.trackedTimeMs)),
  created_at: task.createdAt,
});
