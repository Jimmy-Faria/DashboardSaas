import {
  projectStatusOptions,
  type Folder,
  type Project,
  type ProjectStatus,
  type ProjectTask,
  type WorkspaceMember,
} from "@/store/useProjectStore";

export interface ProjectSummary extends Project {
  folder: Folder | null;
  completedTaskCount: number;
  totalTaskCount: number;
  rootTaskCount: number;
  subtaskCount: number;
  openTaskCount: number;
  progress: number;
  trackedTimeMs: number;
  isOverdue: boolean;
}

export const projectStatusClasses: Record<ProjectStatus, string> = {
  planning: "border-accent/30 bg-accent/10 text-accent",
  active: "border-primary/30 bg-primary/10 text-primary",
  "on-hold": "border-warning/30 bg-warning/10 text-warning",
  completed: "border-success/30 bg-success/10 text-success",
};

export const projectStatusOrder: Record<ProjectStatus, number> = {
  active: 0,
  planning: 1,
  "on-hold": 2,
  completed: 3,
};

export const getProjectStatusLabel = (status: ProjectStatus) =>
  projectStatusOptions.find((option) => option.value === status)?.label ?? "Planning";

export const formatDurationCompact = (milliseconds: number) => {
  const totalMinutes = Math.max(0, Math.floor(milliseconds / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
};

export const getProjectTasks = (tasks: ProjectTask[], projectId: string) =>
  tasks.filter((task) => task.projectId === projectId);

export const getRootTasks = (tasks: ProjectTask[], projectId: string) =>
  getProjectTasks(tasks, projectId).filter((task) => !task.parentTaskId);

export const getSubtasks = (tasks: ProjectTask[], parentTaskId: string) =>
  tasks.filter((task) => task.parentTaskId === parentTaskId);

export const getAssignees = (
  assigneeIds: string[],
  members: WorkspaceMember[]
) =>
  assigneeIds
    .map((assigneeId) => members.find((member) => member.id === assigneeId))
    .filter((member): member is WorkspaceMember => Boolean(member));

export const getProjectSummary = (
  project: Project,
  tasks: ProjectTask[],
  folders: Folder[]
): ProjectSummary => {
  const projectTasks = getProjectTasks(tasks, project.id);
  const completedTaskCount = projectTasks.filter(
    (task) => task.status === "done"
  ).length;
  const totalTaskCount = projectTasks.length;
  const rootTaskCount = projectTasks.filter((task) => !task.parentTaskId).length;
  const subtaskCount = totalTaskCount - rootTaskCount;
  const openTaskCount = totalTaskCount - completedTaskCount;
  const progress = totalTaskCount
    ? Math.round((completedTaskCount / totalTaskCount) * 100)
    : project.progress;
  const trackedTimeMs = projectTasks.reduce(
    (total, task) => total + task.trackedTimeMs,
    0
  );
  const isOverdue =
    project.status !== "completed" &&
    new Date(project.dueDate).getTime() < Date.now();

  return {
    ...project,
    folder: folders.find((folder) => folder.id === project.folderId) ?? null,
    completedTaskCount,
    totalTaskCount,
    rootTaskCount,
    subtaskCount,
    openTaskCount,
    progress,
    trackedTimeMs,
    isOverdue,
  };
};

export const getProjectSummaries = (
  projects: Project[],
  tasks: ProjectTask[],
  folders: Folder[]
) =>
  projects
    .map((project) => getProjectSummary(project, tasks, folders))
    .sort((left, right) => {
      if (projectStatusOrder[left.status] !== projectStatusOrder[right.status]) {
        return projectStatusOrder[left.status] - projectStatusOrder[right.status];
      }

      return new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime();
    });
