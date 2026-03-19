import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { restoreSessionUser, type SessionUser } from "@/lib/mock-auth";

export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in-progress" | "review" | "done";

export interface Project {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  memberCount: number;
  color: "primary" | "warning" | "success" | "accent";
  createdAt: string;
}

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  assignee: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityItem {
  id: string;
  type: "task-created" | "task-moved" | "task-deleted" | "project-created";
  title: string;
  description: string;
  createdAt: string;
  actor: string;
}

interface AddProjectInput {
  name: string;
  description: string;
  dueDate: string;
  memberCount?: number;
}

interface AddTaskInput {
  projectId: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status?: TaskStatus;
  dueDate?: string;
  assignee?: string;
}

interface ProjectState {
  projects: Project[];
  tasks: ProjectTask[];
  activityLog: ActivityItem[];
  currentUser: SessionUser | null;
  hasHydrated: boolean;
  addTask: (input: AddTaskInput) => void;
  updateTaskStatus: (
    taskId: string,
    status: TaskStatus,
    actor?: string
  ) => void;
  addProject: (input: AddProjectInput, actor?: string) => void;
  deleteTask: (taskId: string, actor?: string) => void;
  setCurrentUser: (user: SessionUser | null) => void;
  syncCurrentUser: () => void;
  setHasHydrated: (value: boolean) => void;
}

const now = () => new Date().toISOString();

const createId = (prefix: string) => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const defaultDueDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString();
};

const seedProjects: Project[] = [
  {
    id: "1",
    name: "Marketing Website",
    description: "Complete redesign of the company marketing website with a new launch narrative.",
    dueDate: "2026-03-30T00:00:00.000Z",
    memberCount: 5,
    color: "primary",
    createdAt: "2026-03-01T09:00:00.000Z",
  },
  {
    id: "2",
    name: "Mobile App v2.0",
    description: "Major update focused on onboarding, retention, and performance improvements.",
    dueDate: "2026-04-08T00:00:00.000Z",
    memberCount: 7,
    color: "warning",
    createdAt: "2026-03-02T09:00:00.000Z",
  },
  {
    id: "3",
    name: "API Integration",
    description: "Third-party API integrations for payments, analytics, and notifications.",
    dueDate: "2026-04-14T00:00:00.000Z",
    memberCount: 4,
    color: "success",
    createdAt: "2026-03-03T09:00:00.000Z",
  },
  {
    id: "demo",
    name: "Demo Project",
    description: "Internal sandbox used to present the product flow and UX to stakeholders.",
    dueDate: "2026-03-26T00:00:00.000Z",
    memberCount: 3,
    color: "accent",
    createdAt: "2026-03-04T09:00:00.000Z",
  },
];

const seedTasks: ProjectTask[] = [
  {
    id: "task-1",
    projectId: "1",
    title: "Refactor landing page content",
    description: "Align the hero messaging with the June MVP launch narrative.",
    priority: "high",
    status: "in-progress",
    dueDate: "2026-03-25T00:00:00.000Z",
    assignee: "Alex Morgan",
    createdAt: "2026-03-10T09:00:00.000Z",
    updatedAt: "2026-03-18T11:00:00.000Z",
  },
  {
    id: "task-2",
    projectId: "1",
    title: "Approve final copy",
    description: "Marketing needs a review pass before handing this off to design.",
    priority: "medium",
    status: "review",
    dueDate: "2026-03-24T00:00:00.000Z",
    assignee: "Sarah Chen",
    createdAt: "2026-03-11T09:00:00.000Z",
    updatedAt: "2026-03-17T15:00:00.000Z",
  },
  {
    id: "task-3",
    projectId: "1",
    title: "Ship comparison page",
    description: "Publish the competitive comparison page for sales enablement.",
    priority: "low",
    status: "done",
    dueDate: "2026-03-18T00:00:00.000Z",
    assignee: "Emma Blake",
    createdAt: "2026-03-08T09:00:00.000Z",
    updatedAt: "2026-03-18T17:00:00.000Z",
  },
  {
    id: "task-4",
    projectId: "2",
    title: "Improve onboarding flow",
    description: "Reduce the friction in the first-run experience for new users.",
    priority: "high",
    status: "todo",
    dueDate: "2026-03-27T00:00:00.000Z",
    assignee: "Alex Morgan",
    createdAt: "2026-03-12T09:00:00.000Z",
    updatedAt: "2026-03-12T09:00:00.000Z",
  },
  {
    id: "task-5",
    projectId: "2",
    title: "Audit app performance",
    description: "Measure startup and navigation timings on mid-range devices.",
    priority: "medium",
    status: "in-progress",
    dueDate: "2026-03-26T00:00:00.000Z",
    assignee: "Mike Santos",
    createdAt: "2026-03-13T09:00:00.000Z",
    updatedAt: "2026-03-18T10:30:00.000Z",
  },
  {
    id: "task-6",
    projectId: "2",
    title: "QA the billing edge cases",
    description: "Validate upgrade, downgrade, and expired-card scenarios.",
    priority: "high",
    status: "review",
    dueDate: "2026-03-23T00:00:00.000Z",
    assignee: "Priya Kumar",
    createdAt: "2026-03-14T09:00:00.000Z",
    updatedAt: "2026-03-18T13:15:00.000Z",
  },
  {
    id: "task-7",
    projectId: "3",
    title: "Implement webhook retries",
    description: "Retry failed payment provider webhooks with exponential backoff.",
    priority: "high",
    status: "in-progress",
    dueDate: "2026-03-22T00:00:00.000Z",
    assignee: "Sarah Chen",
    createdAt: "2026-03-15T09:00:00.000Z",
    updatedAt: "2026-03-18T14:30:00.000Z",
  },
  {
    id: "task-8",
    projectId: "3",
    title: "Document API scopes",
    description: "Write the internal handoff doc for auth scopes and rate limits.",
    priority: "low",
    status: "done",
    dueDate: "2026-03-19T00:00:00.000Z",
    assignee: "Emma Blake",
    createdAt: "2026-03-09T09:00:00.000Z",
    updatedAt: "2026-03-19T09:30:00.000Z",
  },
  {
    id: "task-9",
    projectId: "demo",
    title: "Prepare investor walkthrough",
    description: "Curate the project board so the demo tells a coherent product story.",
    priority: "medium",
    status: "todo",
    dueDate: "2026-03-21T00:00:00.000Z",
    assignee: "Alex Morgan",
    createdAt: "2026-03-16T09:00:00.000Z",
    updatedAt: "2026-03-16T09:00:00.000Z",
  },
  {
    id: "task-10",
    projectId: "demo",
    title: "Record product teaser",
    description: "Capture a short teaser video using the new dashboard and task board.",
    priority: "medium",
    status: "done",
    dueDate: "2026-03-17T00:00:00.000Z",
    assignee: "Mike Santos",
    createdAt: "2026-03-07T09:00:00.000Z",
    updatedAt: "2026-03-17T16:00:00.000Z",
  },
];

const seedActivity: ActivityItem[] = [
  {
    id: "activity-1",
    type: "task-moved",
    title: "Task moved to review",
    description: "Approve final copy is ready for stakeholder review.",
    createdAt: "2026-03-18T15:00:00.000Z",
    actor: "Sarah Chen",
  },
  {
    id: "activity-2",
    type: "project-created",
    title: "Demo Project created",
    description: "Internal sandbox was created for product walkthroughs.",
    createdAt: "2026-03-04T09:00:00.000Z",
    actor: "Alex Morgan",
  },
];

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

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: seedProjects,
      tasks: seedTasks,
      activityLog: seedActivity,
      currentUser: null,
      hasHydrated: false,
      addTask: ({
        projectId,
        title,
        description,
        priority,
        status = "todo",
        dueDate,
        assignee,
      }) => {
        const actor = assignee ?? get().currentUser?.name ?? "You";
        const task: ProjectTask = {
          id: createId("task"),
          projectId,
          title: title.trim(),
          description: description.trim(),
          priority,
          status,
          dueDate: dueDate ?? defaultDueDate(),
          assignee: actor,
          createdAt: now(),
          updatedAt: now(),
        };

        const project = get().projects.find((item) => item.id === projectId);

        set((state) => ({
          tasks: [...state.tasks, task],
          activityLog: [
            createActivity(
              "task-created",
              "New task created",
              `${task.title}${project ? ` in ${project.name}` : ""}.`,
              actor
            ),
            ...state.activityLog,
          ].slice(0, 20),
        }));
      },
      updateTaskStatus: (taskId, status, actor) => {
        const task = get().tasks.find((item) => item.id === taskId);

        if (!task || task.status === status) {
          return;
        }

        const activityActor = actor ?? get().currentUser?.name ?? task.assignee ?? "You";

        set((state) => ({
          tasks: state.tasks.map((item) =>
            item.id === taskId
              ? {
                  ...item,
                  status,
                  updatedAt: now(),
                }
              : item
          ),
          activityLog: [
            createActivity(
              "task-moved",
              "Task status updated",
              `${task.title} moved to ${status.replace("-", " ")}.`,
              activityActor
            ),
            ...state.activityLog,
          ].slice(0, 20),
        }));
      },
      addProject: ({ name, description, dueDate, memberCount = 1 }, actor) => {
        const project: Project = {
          id: createId("project"),
          name: name.trim(),
          description: description.trim(),
          dueDate,
          memberCount,
          color: "primary",
          createdAt: now(),
        };

        const activityActor = actor ?? get().currentUser?.name ?? "You";

        set((state) => ({
          projects: [project, ...state.projects],
          activityLog: [
            createActivity(
              "project-created",
              "Project created",
              `${project.name} is now live in your workspace.`,
              activityActor
            ),
            ...state.activityLog,
          ].slice(0, 20),
        }));
      },
      deleteTask: (taskId, actor) => {
        const task = get().tasks.find((item) => item.id === taskId);

        if (!task) {
          return;
        }

        const activityActor = actor ?? get().currentUser?.name ?? "You";

        set((state) => ({
          tasks: state.tasks.filter((item) => item.id !== taskId),
          activityLog: [
            createActivity(
              "task-deleted",
              "Task deleted",
              `${task.title} was removed from the board.`,
              activityActor
            ),
            ...state.activityLog,
          ].slice(0, 20),
        }));
      },
      setCurrentUser: (currentUser) => set({ currentUser }),
      syncCurrentUser: () => set({ currentUser: restoreSessionUser() }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "projectflow-store",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ projects, tasks, activityLog, currentUser }) => ({
        projects,
        tasks,
        activityLog,
        currentUser,
      }),
      onRehydrateStorage: () => (state) => {
        state?.syncCurrentUser();
        state?.setHasHydrated(true);
      },
    }
  )
);
