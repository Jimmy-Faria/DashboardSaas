"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  FolderTree,
  LayoutPanelTop,
  Route,
  Timer,
} from "lucide-react";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { AppLayout } from "@/components/layout/app-layout";
import { ProtectedPageSkeleton } from "@/components/layout/protected-page-skeleton";
import { AssigneeStack } from "@/components/project/assignee-stack";
import { ProjectChatDrawer } from "@/components/project/project-chat-drawer";
import { ProjectGantt } from "@/components/project/project-gantt";
import { ProjectStatusBadge } from "@/components/project/project-status-badge";
import { Badge } from "@/components/ui/badge";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import {
  formatDurationCompact,
  getAssignees,
  getProjectSummary,
  getProjectTasks,
} from "@/lib/projectflow";
import { projectViewOptions, useProjectStore } from "@/store/useProjectStore";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const projects = useProjectStore((state) => state.projects);
  const tasks = useProjectStore((state) => state.tasks);
  const folders = useProjectStore((state) => state.folders);
  const members = useProjectStore((state) => state.members);
  const projectViews = useProjectStore((state) => state.projectViews);
  const workspace = useProjectStore((state) => state.workspace);
  const setProjectView = useProjectStore((state) => state.setProjectView);
  const { isCheckingAuth } = useProtectedRoute();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const project = projects.find((item) => item.id === id);
  const isChatTargeted = searchParams.get("panel") === "chat";

  useEffect(() => {
    if (!project || !isChatTargeted) {
      return;
    }

    setIsChatOpen(true);
  }, [isChatTargeted, project?.id]);

  const handleChatOpenChange = (open: boolean) => {
    setIsChatOpen(open);

    if (!open && isChatTargeted) {
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.delete("panel");
      const nextPath = nextParams.toString()
        ? `${pathname}?${nextParams.toString()}`
        : pathname;

      router.replace(nextPath, { scroll: false });
    }
  };

  if (isCheckingAuth) {
    return <ProtectedPageSkeleton kind="board" />;
  }

  if (!project) {
    return (
      <AppLayout>
        <div className="rounded-3xl border border-border/60 bg-card/90 p-8 shadow-sm backdrop-blur-sm">
          <h1 className="text-2xl font-bold">Project not found</h1>
          <p className="mt-2 text-muted-foreground">
            This project is not available.
          </p>
          <Link
            href="/projects"
            className="mt-6 inline-flex text-sm font-semibold text-primary hover:underline"
          >
            Back to projects
          </Link>
        </div>
      </AppLayout>
    );
  }

  const summary = getProjectSummary(project, tasks, folders);
  const projectTasks = getProjectTasks(tasks, project.id);
  const projectAssignees = getAssignees(project.assigneeIds, members);
  const activeView = projectViews[project.id] ?? workspace.defaultProjectView;

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Link>

          <ProjectChatDrawer
            projectId={project.id}
            open={isChatOpen}
            onOpenChange={handleChatOpenChange}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr),minmax(340px,0.8fr)]">
          <div className="rounded-[2rem] border border-border/60 bg-card/90 p-6 shadow-sm">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <ProjectStatusBadge status={project.status} />
              <Badge variant="outline" className="rounded-full">
                {summary.folder?.name ?? "Folder"}
              </Badge>
              <Badge variant="outline" className="rounded-full">
                {project.customFields.priority} priority
              </Badge>
              {project.syncState === "pending" ? (
                <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/10 text-primary">
                  Syncing
                </Badge>
              ) : null}
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {project.name}
            </h1>
            {project.description ? (
              <p className="mt-3 max-w-3xl text-muted-foreground">
                {project.description}
              </p>
            ) : null}

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-border/60 bg-background/50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Completion
                </p>
                <p className="mt-2 text-2xl font-semibold">{summary.progress}%</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Tasks
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {summary.rootTaskCount} + {summary.subtaskCount}
                </p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Tracked
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {formatDurationCompact(summary.trackedTimeMs)}
                </p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Budget
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {typeof project.customFields.budget === "number"
                    ? `$${project.customFields.budget.toLocaleString()}`
                    : "N/A"}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FolderTree className="h-4 w-4" />
                  <span>{summary.folder?.name ?? "General"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Due{" "}
                    {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }).format(new Date(project.dueDate))}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Timer className="h-4 w-4" />
                  <span>{summary.openTaskCount} open tasks</span>
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-border/60 bg-background/50 p-4">
                <p className="text-sm font-semibold">Assignees</p>
                <AssigneeStack members={projectAssignees} />
                <div className="flex flex-wrap gap-2">
                  {project.customFields.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="rounded-full">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-border/60 bg-background/50 p-4">
              <ProgressBar value={summary.progress} label="Overall Progress" size="md" />
            </div>
          </div>

          <div className="rounded-[2rem] border border-border/60 bg-card/90 p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">View</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {projectViewOptions.map((option) => {
                const isActive = activeView === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setProjectView(project.id, option.value)}
                    className={`rounded-2xl border px-4 py-4 text-left transition-colors ${
                      isActive
                        ? "border-primary/30 bg-primary/10"
                        : "border-border/60 bg-background/50"
                    }`}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      {option.value === "board" ? (
                        <LayoutPanelTop className="h-4 w-4 text-primary" />
                      ) : (
                        <Route className="h-4 w-4 text-primary" />
                      )}
                      <span className="font-semibold text-foreground">
                        {option.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 rounded-2xl border border-border/60 bg-background/50 p-4">
              <p className="text-sm font-semibold">Summary</p>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Total tasks</span>
                  <span>{summary.totalTaskCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Subtasks</span>
                  <span>{summary.subtaskCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tracked</span>
                  <span>{formatDurationCompact(summary.trackedTimeMs)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Mode</span>
                  <span className="capitalize">{activeView}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div>
          {activeView === "board" ? (
            <KanbanBoard projectId={project.id} />
          ) : (
            <ProjectGantt
              tasks={projectTasks}
              members={members}
              projectStatus={project.status}
            />
          )}
        </div>
      </motion.div>
    </AppLayout>
  );
}
