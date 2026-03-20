import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  restoreSessionUser,
  updateSupabaseUserProfile,
  type SessionUser,
} from "@/lib/supabase/auth";
import {
  loadRemoteProjectflowState,
  saveRemoteProjectflowState,
  type RemoteWorkspaceSnapshot,
} from "@/lib/supabase/projectflow-state";

export type ThemePreference = "light" | "dark";
export type ProjectStatus = "planning" | "active" | "on-hold" | "completed";
export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in-progress" | "review" | "done";
export type ProjectColor = "primary" | "warning" | "success" | "accent";
export type ProjectViewMode = "board" | "gantt";
export type MemberRole = "owner" | "admin" | "member";
export type SyncState = "pending" | "synced" | "error";
export type NotificationType =
  | "task-assigned"
  | "task-due-soon"
  | "project-due-soon"
  | "timer-running";
export type NotificationSeverity = "info" | "warning" | "critical";

export interface WorkspaceMember {
  id: string;
  userId?: string | null;
  name: string;
  email: string;
  avatarUrl?: string;
  avatarFallback: string;
  role: MemberRole;
  color: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  memberIds: string[];
  defaultProjectView: ProjectViewMode;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectCustomFields {
  priority: TaskPriority;
  tags: string[];
  budget: number | null;
}

export interface Project {
  id: string;
  userId: string;
  workspaceId: string;
  folderId: string;
  name: string;
  description: string;
  category: string;
  progress: number;
  dueDate: string;
  status: ProjectStatus;
  memberCount: number;
  assigneeIds: string[];
  customFields: ProjectCustomFields;
  color: ProjectColor;
  createdAt: string;
  updatedAt: string;
  syncState: SyncState;
  optimistic: boolean;
}

export interface ProjectTask {
  id: string;
  projectId: string;
  parentTaskId?: string | null;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  assignee: string;
  assigneeIds: string[];
  trackedTimeMs: number;
  timerStartedAt?: string | null;
  timerStartedById?: string | null;
  createdAt: string;
  updatedAt: string;
  syncState: SyncState;
  optimistic: boolean;
}

export interface ActivityItem {
  id: string;
  type:
    | "task-created"
    | "task-moved"
    | "task-deleted"
    | "task-updated"
    | "project-created"
    | "project-updated"
    | "project-deleted"
    | "profile-updated"
    | "workspace-updated"
    | "member-added"
    | "folder-created"
    | "timer-updated";
  title: string;
  description: string;
  createdAt: string;
  actor: string;
}

export interface InboxNotification {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
  href?: string;
  projectId?: string;
  taskId?: string;
}

export interface UserPreferences {
  theme: ThemePreference;
  notificationsEnabled: boolean;
}

export const projectStatusOptions: Array<{
  value: ProjectStatus;
  label: string;
}> = [
  { value: "planning", label: "Planning" },
  { value: "active", label: "Active" },
  { value: "on-hold", label: "On Hold" },
  { value: "completed", label: "Completed" },
];

export const projectViewOptions: Array<{
  value: ProjectViewMode;
  label: string;
}> = [
  { value: "board", label: "Board" },
  { value: "gantt", label: "Gantt" },
];

interface AddFolderInput {
  name: string;
  description?: string;
  color?: string;
}

interface UpdateWorkspaceInput {
  name?: string;
  defaultProjectView?: ProjectViewMode;
}

interface AddWorkspaceMemberInput {
  name: string;
  email: string;
  role?: MemberRole;
  avatarUrl?: string;
}

interface AddProjectInput {
  folderId?: string;
  name: string;
  description: string;
  category?: string;
  progress?: number;
  dueDate: string;
  status?: ProjectStatus;
  assigneeIds?: string[];
  customFields?: Partial<ProjectCustomFields>;
}

interface UpdateProjectInput {
  folderId?: string;
  name?: string;
  description?: string;
  category?: string;
  progress?: number;
  dueDate?: string;
  status?: ProjectStatus;
  assigneeIds?: string[];
  customFields?: Partial<ProjectCustomFields>;
}

interface AddTaskInput {
  projectId: string;
  parentTaskId?: string | null;
  title: string;
  description: string;
  priority: TaskPriority;
  status?: TaskStatus;
  dueDate?: string;
  assigneeIds?: string[];
}

interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string;
  parentTaskId?: string | null;
  assigneeIds?: string[];
}

interface UpdateProfileInput {
  name?: string;
  email?: string;
  password?: string;
  avatarUrl?: string;
  birthDate?: string;
  language?: SessionUser["language"];
}

interface PersistedProjectState {
  workspace?: Partial<Workspace>;
  members?: Partial<WorkspaceMember>[];
  folders?: Partial<Folder>[];
  projects?: Partial<Project>[];
  tasks?: Partial<ProjectTask>[];
  activityLog?: ActivityItem[];
  inbox?: InboxNotification[];
  projectViews?: Record<string, ProjectViewMode>;
  currentUser?: SessionUser | null;
  preferences?: Partial<UserPreferences>;
}

interface ProjectState {
  workspace: Workspace;
  members: WorkspaceMember[];
  folders: Folder[];
  projects: Project[];
  tasks: ProjectTask[];
  activityLog: ActivityItem[];
  inbox: InboxNotification[];
  projectViews: Record<string, ProjectViewMode>;
  currentUser: SessionUser | null;
  preferences: UserPreferences;
  hasHydrated: boolean;
  initializeApp: () => Promise<void>;
  addFolder: (input: AddFolderInput, actor?: string) => void;
  updateWorkspace: (input: UpdateWorkspaceInput, actor?: string) => void;
  addWorkspaceMember: (input: AddWorkspaceMemberInput, actor?: string) => void;
  removeWorkspaceMember: (memberId: string, actor?: string) => void;
  addTask: (input: AddTaskInput, actor?: string) => void;
  updateTask: (taskId: string, input: UpdateTaskInput, actor?: string) => void;
  updateTaskStatus: (
    taskId: string,
    status: TaskStatus,
    actor?: string
  ) => void;
  toggleTaskTimer: (taskId: string, actorId?: string) => void;
  addProject: (input: AddProjectInput, actor?: string) => void;
  updateProject: (
    projectId: string,
    input: UpdateProjectInput,
    actor?: string
  ) => void;
  deleteProject: (projectId: string, actor?: string) => void;
  deleteTask: (taskId: string, actor?: string) => void;
  updateProfile: (input: UpdateProfileInput) => Promise<SessionUser | null>;
  setProjectView: (projectId: string, view: ProjectViewMode) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  setThemePreference: (theme: ThemePreference) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setCurrentUser: (user: SessionUser | null) => void;
  syncCurrentUser: () => Promise<void>;
  setHasHydrated: (value: boolean) => void;
}

const ACTIVITY_LIMIT = 24;
const INBOX_LIMIT = 24;
const DEFAULT_WORKSPACE_NAME = "ProjectFlow";
const SYNC_DELAY_MS = 500;
const MEMBER_COLORS = [
  "bg-primary/15 text-primary",
  "bg-warning/15 text-warning",
  "bg-success/15 text-success",
  "bg-accent/15 text-accent",
  "bg-muted text-muted-foreground",
];

const defaultPreferences: UserPreferences = {
  theme: "light",
  notificationsEnabled: true,
};

const now = () => new Date().toISOString();
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const createId = (prefix: string) => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const createUuid = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    const value = character === "x" ? random : (random & 0x3) | 0x8;

    return value.toString(16);
  });
};

const isUuid = (value?: string | null) => Boolean(value && UUID_PATTERN.test(value));

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "projectflow";

const getInitials = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

const defaultDueDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString();
};

const resolveProjectColor = (status: ProjectStatus): ProjectColor => {
  switch (status) {
    case "active":
      return "primary";
    case "on-hold":
      return "warning";
    case "completed":
      return "success";
    default:
      return "accent";
  }
};

const normalizeProjectStatus = (status?: string): ProjectStatus => {
  if (
    status === "planning" ||
    status === "active" ||
    status === "on-hold" ||
    status === "completed"
  ) {
    return status;
  }

  return "planning";
};

const normalizeTaskStatus = (status?: string): TaskStatus => {
  if (
    status === "todo" ||
    status === "in-progress" ||
    status === "review" ||
    status === "done"
  ) {
    return status;
  }

  return "todo";
};

const normalizeThemePreference = (theme?: string): ThemePreference =>
  theme === "dark" ? "dark" : "light";

const normalizeProjectView = (view?: string): ProjectViewMode =>
  view === "gantt" ? "gantt" : "board";

const normalizePriority = (priority?: string): TaskPriority => {
  if (priority === "low" || priority === "high") {
    return priority;
  }

  return "medium";
};

const normalizeCustomFields = (
  customFields?: Partial<ProjectCustomFields>
): ProjectCustomFields => ({
  priority: normalizePriority(customFields?.priority),
  tags: Array.isArray(customFields?.tags)
    ? customFields.tags
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 8)
    : [],
  budget:
    typeof customFields?.budget === "number" && Number.isFinite(customFields.budget)
      ? customFields.budget
      : null,
});

const normalizePreferences = (
  preferences?: Partial<UserPreferences>
): UserPreferences => ({
  theme: normalizeThemePreference(preferences?.theme),
  notificationsEnabled:
    typeof preferences?.notificationsEnabled === "boolean"
      ? preferences.notificationsEnabled
      : defaultPreferences.notificationsEnabled,
});

const createBaseWorkspace = (): Workspace => {
  const timestamp = now();

  return {
    id: createUuid(),
    name: DEFAULT_WORKSPACE_NAME,
    slug: slugify(DEFAULT_WORKSPACE_NAME),
    memberIds: [],
    defaultProjectView: "board",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

const createBaseFolders = (workspaceId: string): Folder[] => {
  const timestamp = now();

  return [
    {
      id: createUuid(),
      workspaceId,
      name: "General",
      description: "",
      color: MEMBER_COLORS[0],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: createUuid(),
      workspaceId,
      name: "Product",
      description: "",
      color: MEMBER_COLORS[1],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: createUuid(),
      workspaceId,
      name: "Operations",
      description: "",
      color: MEMBER_COLORS[2],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];
};

const createBaseSnapshot = (): PersistedProjectState => {
  const workspace = createBaseWorkspace();

  return {
    workspace,
    members: [],
    folders: createBaseFolders(workspace.id),
    projects: [],
    tasks: [],
    activityLog: [],
    inbox: [],
    projectViews: {},
    currentUser: null,
    preferences: defaultPreferences,
  };
};

const createActivity = (
  type: ActivityItem["type"],
  title: string,
  description: string,
  actor: string
): ActivityItem => ({
  id: createId("activity"),
  type,
  title,
  description,
  createdAt: now(),
  actor,
});

const prependActivity = (
  activityLog: ActivityItem[],
  activity: ActivityItem
) => [activity, ...activityLog].slice(0, ACTIVITY_LIMIT);

const touchProject = (
  projects: Project[],
  projectId: string,
  timestamp: string
) =>
  projects.map((project) =>
    project.id === projectId
      ? {
          ...project,
          updatedAt: timestamp,
        }
      : project
  );

const findMemberByIdentity = (
  members: WorkspaceMember[],
  value?: string | null
) => {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  return (
    members.find((member) => member.id === value) ??
    members.find((member) => member.userId === value) ??
    members.find((member) => member.email.toLowerCase() === normalized) ??
    members.find((member) => member.name.toLowerCase() === normalized) ??
    null
  );
};

const getCurrentMember = (
  members: WorkspaceMember[],
  currentUser: SessionUser | null
) => {
  if (!currentUser) {
    return null;
  }

  return (
    members.find((member) => member.userId === currentUser.id) ??
    members.find(
      (member) => member.email.toLowerCase() === currentUser.email.toLowerCase()
    ) ??
    null
  );
};

const resolveAssigneeIds = ({
  assigneeIds,
  assignee,
  members,
  currentUser,
}: {
  assigneeIds?: string[];
  assignee?: string;
  members: WorkspaceMember[];
  currentUser: SessionUser | null;
}) => {
  const nextIds = Array.isArray(assigneeIds)
    ? assigneeIds
        .map((value) => findMemberByIdentity(members, value)?.id)
        .filter((value): value is string => Boolean(value))
    : [];

  if (nextIds.length) {
    return Array.from(new Set(nextIds));
  }

  const memberFromLegacyAssignee = findMemberByIdentity(members, assignee);

  if (memberFromLegacyAssignee) {
    return [memberFromLegacyAssignee.id];
  }

  const currentMember = getCurrentMember(members, currentUser);
  return currentMember ? [currentMember.id] : [];
};

const resolvePrimaryAssigneeLabel = (
  assigneeIds: string[],
  members: WorkspaceMember[],
  fallback = "Unassigned"
) => {
  if (!assigneeIds.length) {
    return fallback;
  }

  const member = members.find((item) => item.id === assigneeIds[0]);
  return member?.name ?? fallback;
};

const createNotification = (
  input: Omit<InboxNotification, "read">
): InboxNotification => ({
  ...input,
  read: false,
});

const preserveNotificationReadState = (
  previous: InboxNotification[],
  next: InboxNotification[]
) => {
  const previousReadState = new Map(
    previous.map((notification) => [notification.id, notification.read])
  );

  return next.map((notification) => ({
    ...notification,
    read: previousReadState.get(notification.id) ?? notification.read,
  }));
};

const buildInbox = ({
  projects,
  tasks,
  currentUser,
  members,
  previousInbox,
  enabled,
}: {
  projects: Project[];
  tasks: ProjectTask[];
  currentUser: SessionUser | null;
  members: WorkspaceMember[];
  previousInbox: InboxNotification[];
  enabled: boolean;
}) => {
  if (!enabled) {
    return [];
  }

  const currentMember = getCurrentMember(members, currentUser);

  if (!currentMember) {
    return [];
  }

  const currentTime = Date.now();
  const notifications: InboxNotification[] = [];

  tasks.forEach((task) => {
    if (task.parentTaskId) {
      return;
    }

    const isAssignedToCurrentUser = task.assigneeIds.includes(currentMember.id);
    const dueDate = task.dueDate ? new Date(task.dueDate).getTime() : null;
    const isOpen = task.status !== "done";

    if (isAssignedToCurrentUser && isOpen) {
      notifications.push(
        createNotification({
          id: `task-assigned-${task.id}`,
          type: "task-assigned",
          severity: "info",
          title: "Assigned",
          description: task.title,
          createdAt: task.updatedAt,
          href: `/projects/${task.projectId}`,
          projectId: task.projectId,
          taskId: task.id,
        })
      );
    }

    if (!dueDate || !isOpen || !isAssignedToCurrentUser) {
      return;
    }

    const hoursUntilDue = (dueDate - currentTime) / (1000 * 60 * 60);

    if (hoursUntilDue <= 72) {
      notifications.push(
        createNotification({
          id: `task-due-${task.id}`,
          type: "task-due-soon",
          severity: hoursUntilDue < 0 ? "critical" : "warning",
          title: hoursUntilDue < 0 ? "Overdue" : "Due soon",
          description: task.title,
          createdAt: task.updatedAt,
          href: `/projects/${task.projectId}`,
          projectId: task.projectId,
          taskId: task.id,
        })
      );
    }

    if (task.timerStartedAt && task.timerStartedById === currentMember.id) {
      notifications.push(
        createNotification({
          id: `task-timer-${task.id}`,
          type: "timer-running",
          severity: "info",
          title: "Timer running",
          description: task.title,
          createdAt: task.timerStartedAt,
          href: `/projects/${task.projectId}`,
          projectId: task.projectId,
          taskId: task.id,
        })
      );
    }
  });

  projects.forEach((project) => {
    const isAssignedToCurrentUser = project.assigneeIds.includes(currentMember.id);

    if (!isAssignedToCurrentUser || project.status === "completed") {
      return;
    }

    const dueDate = new Date(project.dueDate).getTime();
    const hoursUntilDue = (dueDate - currentTime) / (1000 * 60 * 60);

    if (hoursUntilDue <= 120) {
      notifications.push(
        createNotification({
          id: `project-due-${project.id}`,
          type: "project-due-soon",
          severity: hoursUntilDue < 0 ? "critical" : "warning",
          title: hoursUntilDue < 0 ? "Project overdue" : "Deadline soon",
          description: project.name,
          createdAt: project.updatedAt,
          href: `/projects/${project.id}`,
          projectId: project.id,
        })
      );
    }
  });

  return preserveNotificationReadState(
    previousInbox,
    notifications
      .sort(
        (left, right) =>
          new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      )
      .slice(0, INBOX_LIMIT)
  );
};

const syncCurrentUserMember = ({
  members,
  workspace,
  currentUser,
}: {
  members: WorkspaceMember[];
  workspace: Workspace;
  currentUser: SessionUser | null;
}) => {
  if (!currentUser) {
    return { members, workspace };
  }

  const existingIndex = members.findIndex(
    (member) =>
      member.userId === currentUser.id ||
      member.email.toLowerCase() === currentUser.email.toLowerCase()
  );

  if (existingIndex === -1) {
    const nextMember: WorkspaceMember = {
      id: createId("member"),
      userId: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      avatarUrl: currentUser.avatarUrl,
      avatarFallback: currentUser.avatarFallback,
      role: workspace.memberIds.length === 0 ? "owner" : "member",
      color: MEMBER_COLORS[members.length % MEMBER_COLORS.length],
    };

    return {
      members: [...members, nextMember],
      workspace: {
        ...workspace,
        memberIds: Array.from(new Set([...workspace.memberIds, nextMember.id])),
        updatedAt: now(),
      },
    };
  }

  const nextMembers = [...members];
  const currentMember = nextMembers[existingIndex];
  nextMembers[existingIndex] = {
    ...currentMember,
    userId: currentUser.id,
    name: currentUser.name,
    email: currentUser.email,
    avatarUrl: currentUser.avatarUrl,
    avatarFallback: currentUser.avatarFallback,
  };

  return {
    members: nextMembers,
    workspace: workspace.memberIds.includes(currentMember.id)
      ? workspace
      : {
          ...workspace,
          memberIds: [...workspace.memberIds, currentMember.id],
          updatedAt: now(),
        },
  };
};

const normalizeMember = (
  member: Partial<WorkspaceMember>,
  index: number
): WorkspaceMember => ({
  id: member.id ?? `member-${index + 1}`,
  userId: member.userId ?? null,
  name: member.name?.trim() || `Member ${index + 1}`,
  email: member.email?.trim().toLowerCase() || `member-${index + 1}@projectflow.app`,
  avatarUrl: member.avatarUrl?.trim() || undefined,
  avatarFallback:
    member.avatarFallback?.trim() || getInitials(member.name?.trim() || "PF"),
  role:
    member.role === "owner" || member.role === "admin" || member.role === "member"
      ? member.role
      : "member",
  color: member.color || MEMBER_COLORS[index % MEMBER_COLORS.length],
});

const normalizeWorkspace = (
  workspace: Partial<Workspace> | undefined,
  memberIds: string[],
  fallback: Workspace
): Workspace => {
  const createdAt = workspace?.createdAt ?? fallback.createdAt;
  const name = workspace?.name?.trim() || fallback.name;

  return {
    id: workspace?.id && isUuid(workspace.id) ? workspace.id : fallback.id,
    name,
    slug: workspace?.slug?.trim() || slugify(name),
    memberIds: workspace?.memberIds?.length ? workspace.memberIds : memberIds,
    defaultProjectView: normalizeProjectView(workspace?.defaultProjectView),
    createdAt,
    updatedAt: workspace?.updatedAt ?? createdAt,
  };
};

const normalizeFolder = (
  folder: Partial<Folder>,
  index: number,
  workspaceId: string,
  fallback: Folder[]
): Folder => {
  const fallbackFolder = fallback[index] ?? fallback[0];
  const createdAt = folder.createdAt ?? fallbackFolder?.createdAt ?? now();

  return {
    id: isUuid(folder.id)
      ? (folder.id as string)
      : isUuid(fallbackFolder?.id)
        ? (fallbackFolder?.id as string)
        : createUuid(),
    workspaceId: folder.workspaceId ?? workspaceId,
    name: folder.name?.trim() || fallbackFolder?.name || `Folder ${index + 1}`,
    description: folder.description?.trim() || fallbackFolder?.description || "",
    color: folder.color || fallbackFolder?.color || MEMBER_COLORS[index % MEMBER_COLORS.length],
    createdAt,
    updatedAt: folder.updatedAt ?? createdAt,
  };
};

const normalizeProject = ({
  project,
  index,
  workspaceId,
  folders,
  members,
  currentUser,
}: {
  project: Partial<Project>;
  index: number;
  workspaceId: string;
  folders: Folder[];
  members: WorkspaceMember[];
  currentUser: SessionUser | null;
}): Project => {
  const createdAt = project.createdAt ?? now();
  const status = normalizeProjectStatus(project.status);
  const folderId = folders.some((folder) => folder.id === project.folderId)
    ? (project.folderId as string)
    : folders[0]?.id ?? createUuid();
  const assigneeIds = resolveAssigneeIds({
    assigneeIds: project.assigneeIds,
    members,
    currentUser,
  });

  return {
    id: isUuid(project.id) ? (project.id as string) : createUuid(),
    userId: project.userId ?? currentUser?.id ?? "",
    workspaceId: isUuid(project.workspaceId)
      ? (project.workspaceId as string)
      : workspaceId,
    folderId,
    name: project.name?.trim() || `Project ${index + 1}`,
    description: project.description?.trim() || "",
    category:
      project.category?.trim() ||
      project.customFields?.tags?.[0]?.trim() ||
      "General",
    progress:
      typeof project.progress === "number" && Number.isFinite(project.progress)
        ? Math.min(100, Math.max(0, Math.round(project.progress)))
        : 0,
    dueDate: project.dueDate ?? defaultDueDate(),
    status,
    memberCount: assigneeIds.length,
    assigneeIds,
    customFields: normalizeCustomFields(project.customFields),
    color: resolveProjectColor(status),
    createdAt,
    updatedAt: project.updatedAt ?? createdAt,
    syncState:
      project.syncState === "pending" || project.syncState === "error"
        ? project.syncState
        : "synced",
    optimistic: Boolean(project.optimistic),
  };
};

const normalizeTask = ({
  task,
  index,
  members,
  currentUser,
}: {
  task: Partial<ProjectTask>;
  index: number;
  members: WorkspaceMember[];
  currentUser: SessionUser | null;
}): ProjectTask => {
  const createdAt = task.createdAt ?? now();
  const assigneeIds = resolveAssigneeIds({
    assigneeIds: task.assigneeIds,
    assignee: task.assignee,
    members,
    currentUser,
  });

  return {
    id: isUuid(task.id) ? (task.id as string) : createUuid(),
    projectId: isUuid(task.projectId) ? (task.projectId as string) : "",
    parentTaskId: task.parentTaskId ?? null,
    title: task.title?.trim() || "Task",
    description: task.description?.trim() || "",
    priority: normalizePriority(task.priority),
    status: normalizeTaskStatus(task.status),
    dueDate: task.dueDate ?? defaultDueDate(),
    assigneeIds,
    assignee: resolvePrimaryAssigneeLabel(assigneeIds, members, task.assignee?.trim()),
    trackedTimeMs:
      typeof task.trackedTimeMs === "number" && task.trackedTimeMs >= 0
        ? task.trackedTimeMs
        : 0,
    timerStartedAt: task.timerStartedAt ?? null,
    timerStartedById: task.timerStartedById ?? null,
    createdAt,
    updatedAt: task.updatedAt ?? createdAt,
    syncState:
      task.syncState === "pending" || task.syncState === "error"
        ? task.syncState
        : "synced",
    optimistic: Boolean(task.optimistic),
  };
};

const pickPersistedSnapshot = (
  state: Pick<
    ProjectState,
    | "workspace"
    | "members"
    | "folders"
    | "projects"
    | "tasks"
    | "activityLog"
    | "inbox"
    | "projectViews"
    | "preferences"
    | "currentUser"
  >
): PersistedProjectState => ({
  workspace: state.workspace,
  members: state.members,
  folders: state.folders,
  projects: state.projects,
  tasks: state.tasks,
  activityLog: state.activityLog,
  inbox: state.inbox,
  projectViews: state.projectViews,
  preferences: state.preferences,
  currentUser: state.currentUser,
});

const snapshotHasLocalWork = (
  snapshot?: PersistedProjectState | RemoteWorkspaceSnapshot | null
) => {
  const persistedSnapshot = snapshot as PersistedProjectState | null | undefined;

  return Boolean(
    snapshot?.projects?.length ||
      snapshot?.tasks?.length ||
      persistedSnapshot?.activityLog?.length
  );
};

const normalizeState = ({
  snapshot,
  currentUser,
  fallbackSnapshot,
}: {
  snapshot?: PersistedProjectState | RemoteWorkspaceSnapshot | null;
  currentUser: SessionUser | null;
  fallbackSnapshot: PersistedProjectState;
}) => {
  const baseSnapshot = createBaseSnapshot();
  const typedState = snapshot as PersistedProjectState | undefined;
  const fallbackWorkspace = normalizeWorkspace(
    fallbackSnapshot.workspace,
    [],
    baseSnapshot.workspace as Workspace
  );
  const fallbackFolders = Array.isArray(fallbackSnapshot.folders)
    ? fallbackSnapshot.folders.map((folder, index) =>
        normalizeFolder(folder, index, fallbackWorkspace.id, createBaseFolders(fallbackWorkspace.id))
      )
    : createBaseFolders(fallbackWorkspace.id);

  const normalizedMembers = Array.isArray(typedState?.members)
    ? typedState.members.map((member, index) => normalizeMember(member, index))
    : Array.isArray(fallbackSnapshot.members)
      ? fallbackSnapshot.members.map((member, index) => normalizeMember(member, index))
      : [];

  const normalizedWorkspace = normalizeWorkspace(
    typedState?.workspace,
    normalizedMembers.map((member) => member.id),
    fallbackWorkspace
  );

  const normalizedFolders = Array.isArray(typedState?.folders)
    ? typedState.folders.map((folder, index) =>
        normalizeFolder(folder, index, normalizedWorkspace.id, fallbackFolders)
      )
    : fallbackFolders;

  const syncedUserState = syncCurrentUserMember({
    members: normalizedMembers,
    workspace: normalizedWorkspace,
    currentUser,
  });

  const fallbackProjectsById = new Map(
    (Array.isArray(fallbackSnapshot.projects) ? fallbackSnapshot.projects : [])
      .filter((project): project is Partial<Project> & { id: string } => Boolean(project?.id))
      .map((project) => [project.id, project])
  );

  const normalizedProjects = Array.isArray(typedState?.projects)
    ? typedState.projects.map((project, index) => {
        const fallbackProject = project.id
          ? fallbackProjectsById.get(project.id as string)
          : undefined;

        return normalizeProject({
          project: {
            ...fallbackProject,
            ...project,
            folderId: project.folderId ?? fallbackProject?.folderId,
            assigneeIds:
              Array.isArray(project.assigneeIds) && project.assigneeIds.length > 0
                ? project.assigneeIds
                : fallbackProject?.assigneeIds,
            customFields: normalizeCustomFields({
              ...fallbackProject?.customFields,
              ...project.customFields,
            }),
          },
          index,
          workspaceId: syncedUserState.workspace.id,
          folders: normalizedFolders,
          members: syncedUserState.members,
          currentUser,
        })
      })
    : [];

  const fallbackTasksById = new Map(
    (Array.isArray(fallbackSnapshot.tasks) ? fallbackSnapshot.tasks : [])
      .filter((task): task is Partial<ProjectTask> & { id: string } => Boolean(task?.id))
      .map((task) => [task.id, task])
  );

  const normalizedTasks = Array.isArray(typedState?.tasks)
    ? typedState.tasks
        .map((task, index) => {
          const fallbackTask = task.id ? fallbackTasksById.get(task.id as string) : undefined;

          return (
          normalizeTask({
            task: {
              ...fallbackTask,
              ...task,
              assigneeIds:
                Array.isArray(task.assigneeIds) && task.assigneeIds.length > 0
                  ? task.assigneeIds
                  : fallbackTask?.assigneeIds,
              timerStartedAt: task.timerStartedAt ?? fallbackTask?.timerStartedAt,
              timerStartedById: task.timerStartedById ?? fallbackTask?.timerStartedById,
            },
            index,
            members: syncedUserState.members,
            currentUser,
          })
          );
        })
        .filter((task) =>
          normalizedProjects.some((project) => project.id === task.projectId)
        )
    : [];

  const preferences = normalizePreferences(
    typedState?.preferences ?? fallbackSnapshot.preferences
  );

  const inbox = buildInbox({
    projects: normalizedProjects,
    tasks: normalizedTasks,
    currentUser,
    members: syncedUserState.members,
    previousInbox: Array.isArray(typedState?.inbox) ? typedState.inbox : [],
    enabled: preferences.notificationsEnabled,
  });

  return {
    workspace: syncedUserState.workspace,
    members: syncedUserState.members,
    folders: normalizedFolders,
    projects: normalizedProjects,
    tasks: normalizedTasks,
    activityLog: Array.isArray(typedState?.activityLog) ? typedState.activityLog : [],
    inbox,
    projectViews:
      typedState?.projectViews && typeof typedState.projectViews === "object"
        ? Object.fromEntries(
            Object.entries(typedState.projectViews).map(([key, value]) => [
              key,
              normalizeProjectView(value),
            ])
          )
        : {},
    currentUser,
    preferences,
  };
};

const queueRemoteSync = (
  user: SessionUser | null,
  snapshot: PersistedProjectState
) => {
  if (!user?.id || typeof window === "undefined") {
    return;
  }

  if (remoteSyncTimer) {
    clearTimeout(remoteSyncTimer);
  }

  remoteSyncTimer = setTimeout(() => {
    void saveRemoteProjectflowState({
      userId: user.id,
      snapshot,
    }).catch((error) => {
      console.error("Unable to sync ProjectFlow state to Supabase.", error);
    });
  }, 350);
};

const baseSnapshot = createBaseSnapshot();
const baseState = normalizeState({
  snapshot: baseSnapshot,
  currentUser: null,
  fallbackSnapshot: baseSnapshot,
});

let remoteSyncTimer: ReturnType<typeof setTimeout> | null = null;

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      ...baseState,
      hasHydrated: false,
      initializeApp: async () => {
        try {
          const restoredUser = await restoreSessionUser();
          const localSnapshot = pickPersistedSnapshot(get());
          const remoteSnapshot = restoredUser
            ? await loadRemoteProjectflowState()
            : null;
          const fallbackSnapshot = localSnapshot ?? baseSnapshot;
          const localHasExtraFolders =
            (fallbackSnapshot.folders?.length ?? 0) > (remoteSnapshot?.folders?.length ?? 0);
          const shouldPreserveLocalSnapshot =
            Boolean(restoredUser) &&
            (snapshotHasLocalWork(fallbackSnapshot) || localHasExtraFolders) &&
            !snapshotHasLocalWork(remoteSnapshot) &&
            (fallbackSnapshot.folders?.length ?? 0) >=
              (remoteSnapshot?.folders?.length ?? 0);
          const sourceSnapshot = shouldPreserveLocalSnapshot
            ? fallbackSnapshot
            : remoteSnapshot ?? fallbackSnapshot;
          const nextState = normalizeState({
            snapshot: sourceSnapshot,
            currentUser: restoredUser,
            fallbackSnapshot,
          });

          set({
            ...nextState,
            hasHydrated: true,
          });

          if (restoredUser && (!remoteSnapshot || shouldPreserveLocalSnapshot)) {
            queueRemoteSync(restoredUser, pickPersistedSnapshot(get()));
          }
        } catch (error) {
          console.error("Unable to initialize ProjectFlow.", error);
          set({
            ...normalizeState({
              snapshot: baseSnapshot,
              currentUser: null,
              fallbackSnapshot: baseSnapshot,
            }),
            hasHydrated: true,
          });
        }
      },
      addFolder: ({ name, description, color }, actor) => {
        if (!name.trim()) {
          return;
        }

        const timestamp = now();
        const nextFolder: Folder = {
          id: createUuid(),
          workspaceId: get().workspace.id,
          name: name.trim(),
          description: description?.trim() || "",
          color: color?.trim() || MEMBER_COLORS[get().folders.length % MEMBER_COLORS.length],
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        const activityActor = actor ?? get().currentUser?.name ?? "You";

        set((state) => ({
          folders: [nextFolder, ...state.folders],
          activityLog: prependActivity(
            state.activityLog,
            createActivity("folder-created", "Folder created", nextFolder.name, activityActor)
          ),
        }));

        queueRemoteSync(get().currentUser, pickPersistedSnapshot(get()));
      },
      updateWorkspace: ({ name, defaultProjectView }, actor) => {
        const nextName = name?.trim() || get().workspace.name;
        const nextView = defaultProjectView ?? get().workspace.defaultProjectView;
        const timestamp = now();
        const activityActor = actor ?? get().currentUser?.name ?? "You";

        set((state) => ({
          workspace: {
            ...state.workspace,
            name: nextName,
            slug: slugify(nextName),
            defaultProjectView: nextView,
            updatedAt: timestamp,
          },
          activityLog: prependActivity(
            state.activityLog,
            createActivity("workspace-updated", "Workspace updated", nextName, activityActor)
          ),
        }));

        queueRemoteSync(get().currentUser, pickPersistedSnapshot(get()));
      },
      addWorkspaceMember: ({ name, email, role = "member", avatarUrl }, actor) => {
        if (!name.trim() || !email.trim()) {
          return;
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (
          get().members.some(
            (member) => member.email.toLowerCase() === normalizedEmail
          )
        ) {
          return;
        }

        const timestamp = now();
        const nextMember: WorkspaceMember = {
          id: createId("member"),
          userId: null,
          name: name.trim(),
          email: normalizedEmail,
          avatarUrl: avatarUrl?.trim() || undefined,
          avatarFallback: getInitials(name.trim()),
          role,
          color: MEMBER_COLORS[get().members.length % MEMBER_COLORS.length],
        };
        const activityActor = actor ?? get().currentUser?.name ?? "You";

        set((state) => ({
          members: [...state.members, nextMember],
          workspace: {
            ...state.workspace,
            memberIds: [...state.workspace.memberIds, nextMember.id],
            updatedAt: timestamp,
          },
          activityLog: prependActivity(
            state.activityLog,
            createActivity("member-added", "Member added", nextMember.name, activityActor)
          ),
        }));

        queueRemoteSync(get().currentUser, pickPersistedSnapshot(get()));
      },
      removeWorkspaceMember: (memberId, actor) => {
        const member = get().members.find((item) => item.id === memberId);
        const currentUser = get().currentUser;

        if (
          !member ||
          (currentUser &&
            (member.userId === currentUser.id ||
              member.email.toLowerCase() === currentUser.email.toLowerCase()))
        ) {
          return;
        }

        const activityActor = actor ?? currentUser?.name ?? "You";

        set((state) => {
          const nextMembers = state.members.filter((item) => item.id !== memberId);
          const nextProjects = state.projects.map((project) => {
            const nextAssigneeIds = project.assigneeIds.filter((id) => id !== memberId);
            return {
              ...project,
              assigneeIds: nextAssigneeIds,
              memberCount: nextAssigneeIds.length,
            };
          });
          const nextTasks = state.tasks.map((task) => {
            const nextAssigneeIds = task.assigneeIds.filter((id) => id !== memberId);
            return {
              ...task,
              assigneeIds: nextAssigneeIds,
              assignee: resolvePrimaryAssigneeLabel(nextAssigneeIds, nextMembers),
            };
          });

          return {
            members: nextMembers,
            workspace: {
              ...state.workspace,
              memberIds: state.workspace.memberIds.filter((id) => id !== memberId),
              updatedAt: now(),
            },
            projects: nextProjects,
            tasks: nextTasks,
            inbox: buildInbox({
              projects: nextProjects,
              tasks: nextTasks,
              currentUser: state.currentUser,
              members: nextMembers,
              previousInbox: state.inbox,
              enabled: state.preferences.notificationsEnabled,
            }),
            activityLog: prependActivity(
              state.activityLog,
              createActivity("workspace-updated", "Member removed", member.name, activityActor)
            ),
          };
        });

        queueRemoteSync(get().currentUser, pickPersistedSnapshot(get()));
      },
      addTask: (
        {
          projectId,
          parentTaskId = null,
          title,
          description,
          priority,
          status = "todo",
          dueDate,
          assigneeIds,
        },
        actor
      ) => {
        const timestamp = now();
        const resolvedAssigneeIds = resolveAssigneeIds({
          assigneeIds,
          members: get().members,
          currentUser: get().currentUser,
        });
        const task: ProjectTask = {
          id: createUuid(),
          projectId,
          parentTaskId,
          title: title.trim(),
          description: description.trim(),
          priority,
          status,
          dueDate: dueDate ?? defaultDueDate(),
          assigneeIds: resolvedAssigneeIds,
          assignee: resolvePrimaryAssigneeLabel(resolvedAssigneeIds, get().members),
          trackedTimeMs: 0,
          timerStartedAt: null,
          timerStartedById: null,
          createdAt: timestamp,
          updatedAt: timestamp,
          syncState: "pending" as const,
          optimistic: true,
        };

        const project = get().projects.find((item) => item.id === projectId);
        const activityActor = actor ?? get().currentUser?.name ?? "You";

        set((state) => {
          const nextTasks = [...state.tasks, task];
          const nextProjects = touchProject(state.projects, projectId, timestamp);

          return {
            tasks: nextTasks,
            projects: nextProjects,
            inbox: buildInbox({
              projects: nextProjects,
              tasks: nextTasks,
              currentUser: state.currentUser,
              members: state.members,
              previousInbox: state.inbox,
              enabled: state.preferences.notificationsEnabled,
            }),
            activityLog: prependActivity(
              state.activityLog,
              createActivity(
                "task-created",
                parentTaskId ? "Subtask created" : "Task created",
                project ? `${project.name} · ${task.title}` : task.title,
                activityActor
              )
            ),
          };
        });

        queueRemoteSync(get().currentUser, pickPersistedSnapshot(get()));

        setTimeout(() => {
          set((state) => ({
            tasks: state.tasks.map((item) =>
              item.id === task.id
                ? { ...item, syncState: "synced" as const, optimistic: false }
                : item
            ),
          }));
        }, SYNC_DELAY_MS);
      },
      updateTask: (taskId, input, actor) => {
        const task = get().tasks.find((item) => item.id === taskId);

        if (!task) {
          return;
        }

        const timestamp = now();
        const nextAssigneeIds = input.assigneeIds
          ? resolveAssigneeIds({
              assigneeIds: input.assigneeIds,
              members: get().members,
              currentUser: get().currentUser,
            })
          : task.assigneeIds;
        const activityActor = actor ?? get().currentUser?.name ?? task.assignee ?? "You";

        set((state) => {
          const nextTasks = state.tasks.map((item) =>
            item.id === taskId
              ? {
                  ...item,
                  title: input.title?.trim() || item.title,
                  description:
                    typeof input.description === "string"
                      ? input.description.trim()
                      : item.description,
                  priority: input.priority ?? item.priority,
                  status: input.status ?? item.status,
                  dueDate: input.dueDate ?? item.dueDate,
                  parentTaskId:
                    typeof input.parentTaskId === "undefined"
                      ? item.parentTaskId
                      : input.parentTaskId,
                  assigneeIds: nextAssigneeIds,
                  assignee: resolvePrimaryAssigneeLabel(nextAssigneeIds, state.members),
                  updatedAt: timestamp,
                  syncState: "pending" as const,
                  optimistic: true,
                }
              : item
          );
          const nextProjects = touchProject(state.projects, task.projectId, timestamp);

          return {
            tasks: nextTasks,
            projects: nextProjects,
            inbox: buildInbox({
              projects: nextProjects,
              tasks: nextTasks,
              currentUser: state.currentUser,
              members: state.members,
              previousInbox: state.inbox,
              enabled: state.preferences.notificationsEnabled,
            }),
            activityLog: prependActivity(
              state.activityLog,
              createActivity("task-updated", "Task updated", task.title, activityActor)
            ),
          };
        });

        queueRemoteSync(get().currentUser, pickPersistedSnapshot(get()));

        setTimeout(() => {
          set((state) => ({
            tasks: state.tasks.map((item) =>
              item.id === taskId
                ? { ...item, syncState: "synced" as const, optimistic: false }
                : item
            ),
          }));
        }, SYNC_DELAY_MS);
      },
      updateTaskStatus: (taskId, status, actor) => {
        const task = get().tasks.find((item) => item.id === taskId);

        if (!task || task.status === status) {
          return;
        }

        const timestamp = now();
        const activityActor = actor ?? get().currentUser?.name ?? task.assignee ?? "You";

        set((state) => {
          const nextTasks = state.tasks.map((item) =>
            item.id === taskId
              ? {
                  ...item,
                  status,
                  updatedAt: timestamp,
                  syncState: "pending" as const,
                  optimistic: true,
                }
              : item
          );
          const nextProjects = touchProject(state.projects, task.projectId, timestamp);

          return {
            tasks: nextTasks,
            projects: nextProjects,
            inbox: buildInbox({
              projects: nextProjects,
              tasks: nextTasks,
              currentUser: state.currentUser,
              members: state.members,
              previousInbox: state.inbox,
              enabled: state.preferences.notificationsEnabled,
            }),
            activityLog: prependActivity(
              state.activityLog,
              createActivity(
                "task-moved",
                "Task moved",
                `${task.title} · ${status.replace("-", " ")}`,
                activityActor
              )
            ),
          };
        });

        queueRemoteSync(get().currentUser, pickPersistedSnapshot(get()));

        setTimeout(() => {
          set((state) => ({
            tasks: state.tasks.map((item) =>
              item.id === taskId
                ? { ...item, syncState: "synced" as const, optimistic: false }
                : item
            ),
          }));
        }, SYNC_DELAY_MS);
      },
      toggleTaskTimer: (taskId, actorId) => {
        const task = get().tasks.find((item) => item.id === taskId);

        if (!task) {
          return;
        }

        const timestamp = new Date();
        const currentMember = findMemberByIdentity(
          get().members,
          actorId ?? getCurrentMember(get().members, get().currentUser)?.id
        );
        const activityActor = currentMember?.name ?? get().currentUser?.name ?? "You";

        set((state) => {
          const nextTasks = state.tasks.map((item) => {
            if (item.id !== taskId) {
              return item;
            }

            if (item.timerStartedAt) {
              const elapsedMs = Math.max(
                0,
                timestamp.getTime() - new Date(item.timerStartedAt).getTime()
              );

              return {
                ...item,
                trackedTimeMs: item.trackedTimeMs + elapsedMs,
                timerStartedAt: null,
                timerStartedById: null,
                updatedAt: timestamp.toISOString(),
                syncState: "pending" as const,
                optimistic: true,
              };
            }

            return {
              ...item,
              timerStartedAt: timestamp.toISOString(),
              timerStartedById: currentMember?.id ?? null,
              updatedAt: timestamp.toISOString(),
              syncState: "pending" as const,
              optimistic: true,
            };
          });
          const nextProjects = touchProject(
            state.projects,
            task.projectId,
            timestamp.toISOString()
          );

          return {
            tasks: nextTasks,
            projects: nextProjects,
            inbox: buildInbox({
              projects: nextProjects,
              tasks: nextTasks,
              currentUser: state.currentUser,
              members: state.members,
              previousInbox: state.inbox,
              enabled: state.preferences.notificationsEnabled,
            }),
            activityLog: prependActivity(
              state.activityLog,
              createActivity(
                "timer-updated",
                task.timerStartedAt ? "Timer paused" : "Timer started",
                task.title,
                activityActor
              )
            ),
          };
        });

        queueRemoteSync(get().currentUser, pickPersistedSnapshot(get()));

        setTimeout(() => {
          set((state) => ({
            tasks: state.tasks.map((item) =>
              item.id === taskId
                ? { ...item, syncState: "synced" as const, optimistic: false }
                : item
            ),
          }));
        }, SYNC_DELAY_MS);
      },
      addProject: (
        {
          folderId,
          name,
          description,
          category,
          progress,
          dueDate,
          status = "planning",
          assigneeIds,
          customFields,
        },
        actor
      ) => {
        const timestamp = now();
        const normalizedStatus = normalizeProjectStatus(status);
        const resolvedAssigneeIds = resolveAssigneeIds({
          assigneeIds,
          members: get().members,
          currentUser: get().currentUser,
        });
        const project: Project = {
          id: createUuid(),
          userId: get().currentUser?.id ?? "",
          workspaceId: get().workspace.id,
          folderId:
            folderId && get().folders.some((folder) => folder.id === folderId)
              ? folderId
              : get().folders[0]?.id ?? createUuid(),
          name: name.trim(),
          description: description.trim(),
          category: category?.trim() || customFields?.tags?.[0]?.trim() || "General",
          progress:
            typeof progress === "number" && Number.isFinite(progress)
              ? Math.min(100, Math.max(0, Math.round(progress)))
              : 0,
          dueDate,
          status: normalizedStatus,
          memberCount: resolvedAssigneeIds.length,
          assigneeIds: resolvedAssigneeIds,
          customFields: normalizeCustomFields(customFields),
          color: resolveProjectColor(normalizedStatus),
          createdAt: timestamp,
          updatedAt: timestamp,
          syncState: "pending" as const,
          optimistic: true,
        };
        const activityActor = actor ?? get().currentUser?.name ?? "You";

        set((state) => {
          const nextProjects = [project, ...state.projects];

          return {
            projects: nextProjects,
            inbox: buildInbox({
              projects: nextProjects,
              tasks: state.tasks,
              currentUser: state.currentUser,
              members: state.members,
              previousInbox: state.inbox,
              enabled: state.preferences.notificationsEnabled,
            }),
            activityLog: prependActivity(
              state.activityLog,
              createActivity("project-created", "Project created", project.name, activityActor)
            ),
          };
        });

        queueRemoteSync(get().currentUser, pickPersistedSnapshot(get()));

        setTimeout(() => {
          set((state) => ({
            projects: state.projects.map((item) =>
              item.id === project.id
                ? { ...item, syncState: "synced" as const, optimistic: false }
                : item
            ),
          }));
        }, SYNC_DELAY_MS);
      },
      updateProject: (projectId, input, actor) => {
        const project = get().projects.find((item) => item.id === projectId);

        if (!project) {
          return;
        }

        const timestamp = now();
        const nextStatus = input.status
          ? normalizeProjectStatus(input.status)
          : project.status;
        const nextAssigneeIds = input.assigneeIds
          ? resolveAssigneeIds({
              assigneeIds: input.assigneeIds,
              members: get().members,
              currentUser: get().currentUser,
            })
          : project.assigneeIds;
        const activityActor = actor ?? get().currentUser?.name ?? "You";

        set((state) => {
          const nextProjects = state.projects.map((item) =>
            item.id === projectId
              ? {
                  ...item,
                  folderId:
                    input.folderId && state.folders.some((folder) => folder.id === input.folderId)
                      ? input.folderId
                      : item.folderId,
                  name: input.name?.trim() || item.name,
                  description:
                    typeof input.description === "string"
                      ? input.description.trim()
                      : item.description,
                  category: input.category?.trim() || item.category,
                  progress:
                    typeof input.progress === "number" && Number.isFinite(input.progress)
                      ? Math.min(100, Math.max(0, Math.round(input.progress)))
                      : item.progress,
                  dueDate: input.dueDate ?? item.dueDate,
                  status: nextStatus,
                  assigneeIds: nextAssigneeIds,
                  memberCount: nextAssigneeIds.length,
                  customFields: normalizeCustomFields({
                    ...item.customFields,
                    ...input.customFields,
                  }),
                  color: resolveProjectColor(nextStatus),
                  updatedAt: timestamp,
                  syncState: "pending" as const,
                  optimistic: true,
                }
              : item
          );

          return {
            projects: nextProjects,
            inbox: buildInbox({
              projects: nextProjects,
              tasks: state.tasks,
              currentUser: state.currentUser,
              members: state.members,
              previousInbox: state.inbox,
              enabled: state.preferences.notificationsEnabled,
            }),
            activityLog: prependActivity(
              state.activityLog,
              createActivity(
                "project-updated",
                "Project updated",
                input.name?.trim() || project.name,
                activityActor
              )
            ),
          };
        });

        queueRemoteSync(get().currentUser, pickPersistedSnapshot(get()));

        setTimeout(() => {
          set((state) => ({
            projects: state.projects.map((item) =>
              item.id === projectId
                ? { ...item, syncState: "synced" as const, optimistic: false }
                : item
            ),
          }));
        }, SYNC_DELAY_MS);
      },
      deleteProject: (projectId, actor) => {
        const project = get().projects.find((item) => item.id === projectId);

        if (!project) {
          return;
        }

        const activityActor = actor ?? get().currentUser?.name ?? "You";

        set((state) => {
          const nextProjects = state.projects.filter((item) => item.id !== projectId);
          const nextTasks = state.tasks.filter((item) => item.projectId !== projectId);
          const { [projectId]: _removedView, ...nextProjectViews } = state.projectViews;

          return {
            projects: nextProjects,
            tasks: nextTasks,
            projectViews: nextProjectViews,
            inbox: buildInbox({
              projects: nextProjects,
              tasks: nextTasks,
              currentUser: state.currentUser,
              members: state.members,
              previousInbox: state.inbox,
              enabled: state.preferences.notificationsEnabled,
            }),
            activityLog: prependActivity(
              state.activityLog,
              createActivity("project-deleted", "Project deleted", project.name, activityActor)
            ),
          };
        });

        queueRemoteSync(get().currentUser, pickPersistedSnapshot(get()));
      },
      deleteTask: (taskId, actor) => {
        const task = get().tasks.find((item) => item.id === taskId);

        if (!task) {
          return;
        }

        const timestamp = now();
        const activityActor = actor ?? get().currentUser?.name ?? task.assignee ?? "You";

        set((state) => {
          const nextTasks = state.tasks.filter(
            (item) => item.id !== taskId && item.parentTaskId !== taskId
          );
          const nextProjects = touchProject(state.projects, task.projectId, timestamp);

          return {
            tasks: nextTasks,
            projects: nextProjects,
            inbox: buildInbox({
              projects: nextProjects,
              tasks: nextTasks,
              currentUser: state.currentUser,
              members: state.members,
              previousInbox: state.inbox,
              enabled: state.preferences.notificationsEnabled,
            }),
            activityLog: prependActivity(
              state.activityLog,
              createActivity("task-deleted", "Task deleted", task.title, activityActor)
            ),
          };
        });

        queueRemoteSync(get().currentUser, pickPersistedSnapshot(get()));
      },
      updateProfile: async (input) => {
        const currentUser = get().currentUser;

        if (!currentUser) {
          return null;
        }

        const nextUser = await updateSupabaseUserProfile({
          name: input.name ?? currentUser.name,
          email: input.email ?? currentUser.email,
          password: input.password,
          avatarUrl:
            typeof input.avatarUrl === "string"
              ? input.avatarUrl
              : currentUser.avatarUrl,
          birthDate:
            typeof input.birthDate === "string"
              ? input.birthDate
              : currentUser.birthDate,
          language: input.language ?? currentUser.language,
        });

        set((state) => {
          const synced = syncCurrentUserMember({
            members: state.members,
            workspace: state.workspace,
            currentUser: nextUser,
          });

          return {
            currentUser: nextUser,
            members: synced.members,
            workspace: synced.workspace,
            inbox: buildInbox({
              projects: state.projects,
              tasks: state.tasks,
              currentUser: nextUser,
              members: synced.members,
              previousInbox: state.inbox,
              enabled: state.preferences.notificationsEnabled,
            }),
            activityLog: prependActivity(
              state.activityLog,
              createActivity("profile-updated", "Profile updated", nextUser.name, nextUser.name)
            ),
          };
        });

        queueRemoteSync(nextUser, pickPersistedSnapshot(get()));
        return nextUser;
      },
      setProjectView: (projectId, view) => {
        set((state) => ({
          projectViews: {
            ...state.projectViews,
            [projectId]: view,
          },
        }));

        queueRemoteSync(get().currentUser, pickPersistedSnapshot(get()));
      },
      markNotificationRead: (notificationId) => {
        set((state) => ({
          inbox: state.inbox.map((notification) =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          ),
        }));

        queueRemoteSync(get().currentUser, pickPersistedSnapshot(get()));
      },
      markAllNotificationsRead: () => {
        set((state) => ({
          inbox: state.inbox.map((notification) => ({
            ...notification,
            read: true,
          })),
        }));

        queueRemoteSync(get().currentUser, pickPersistedSnapshot(get()));
      },
      setThemePreference: (theme) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            theme,
          },
        }));

        queueRemoteSync(get().currentUser, pickPersistedSnapshot(get()));
      },
      setNotificationsEnabled: (enabled) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            notificationsEnabled: enabled,
          },
          inbox: buildInbox({
            projects: state.projects,
            tasks: state.tasks,
            currentUser: state.currentUser,
            members: state.members,
            previousInbox: state.inbox,
            enabled,
          }),
        }));

        queueRemoteSync(get().currentUser, pickPersistedSnapshot(get()));
      },
      setCurrentUser: (currentUser) => {
        if (!currentUser) {
          set((state) => ({
            ...normalizeState({
              snapshot: {
                ...baseSnapshot,
                preferences: state.preferences,
              },
              currentUser: null,
              fallbackSnapshot: {
                ...baseSnapshot,
                preferences: state.preferences,
              },
            }),
            hasHydrated: state.hasHydrated,
          }));
          return;
        }

        set((state) => {
          const synced = syncCurrentUserMember({
            members: state.members,
            workspace: state.workspace,
            currentUser,
          });

          return {
            currentUser,
            members: synced.members,
            workspace: synced.workspace,
            inbox: buildInbox({
              projects: state.projects,
              tasks: state.tasks,
              currentUser,
              members: synced.members,
              previousInbox: state.inbox,
              enabled: state.preferences.notificationsEnabled,
            }),
          };
        });
      },
      syncCurrentUser: async () => {
        await get().initializeApp();
      },
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "projectflow-store",
      storage: createJSONStorage(() => localStorage),
      partialize: ({
        workspace,
        members,
        folders,
        projects,
        tasks,
        activityLog,
        inbox,
        currentUser,
        preferences,
        projectViews,
      }) => ({
        workspace,
        members,
        folders,
        projects,
        tasks,
        activityLog,
        inbox,
        currentUser,
        preferences,
        projectViews,
      }),
      merge: (persistedState, currentState) => {
        const typedState = persistedState as PersistedProjectState | undefined;

        return {
          ...currentState,
          ...normalizeState({
            snapshot: typedState,
            currentUser:
              typeof typedState?.currentUser === "undefined"
                ? currentState.currentUser
                : typedState.currentUser,
            fallbackSnapshot: baseSnapshot,
          }),
          hasHydrated: false,
        };
      },
    }
  )
);
