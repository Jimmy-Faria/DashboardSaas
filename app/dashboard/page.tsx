"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BellRing,
  CheckCircle2,
  FolderTree,
  ListTodo,
  MessageSquareMore,
  Timer,
} from "lucide-react";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { StatsCard } from "@/components/dashboard/stats-card";
import { AppLayout } from "@/components/layout/app-layout";
import { ProtectedPageSkeleton } from "@/components/layout/protected-page-skeleton";
import { AssigneeStack } from "@/components/project/assignee-stack";
import { ProjectStatusBadge } from "@/components/project/project-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import {
  formatDurationCompact,
  getAssignees,
  getProjectSummaries,
} from "@/lib/projectflow";
import { useProjectStore } from "@/store/useProjectStore";

export default function DashboardPage() {
  const workspace = useProjectStore((state) => state.workspace);
  const folders = useProjectStore((state) => state.folders);
  const members = useProjectStore((state) => state.members);
  const tasks = useProjectStore((state) => state.tasks);
  const projects = useProjectStore((state) => state.projects);
  const inbox = useProjectStore((state) => state.inbox);
  const { currentUser, isCheckingAuth } = useProtectedRoute();

  if (isCheckingAuth) {
    return <ProtectedPageSkeleton kind="dashboard" />;
  }

  const projectSummaries = getProjectSummaries(projects, tasks, folders);
  const rootTasks = tasks.filter((task) => !task.parentTaskId);
  const openTasks = rootTasks.filter((task) => task.status !== "done").length;
  const completedTasks = tasks.filter((task) => task.status === "done").length;
  const totalTrackedTime = tasks.reduce((total, task) => total + task.trackedTimeMs, 0);
  const unreadAlerts = inbox.filter((notification) => !notification.read).length;
  const overallProgress = projectSummaries.length
    ? Math.round(
        projectSummaries.reduce((total, project) => total + project.progress, 0) /
          projectSummaries.length
      )
    : 0;

  const stats = [
    {
      title: "Active Projects",
      value: projectSummaries.filter((project) => project.status === "active").length,
      icon: FolderTree,
      color: "primary" as const,
    },
    {
      title: "Open Tasks",
      value: openTasks,
      icon: ListTodo,
      color: "warning" as const,
    },
    {
      title: "Completed",
      value: completedTasks,
      icon: CheckCircle2,
      color: "success" as const,
    },
    {
      title: "Unread Alerts",
      value: unreadAlerts,
      icon: BellRing,
      color: "destructive" as const,
    },
  ];

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        className="mb-10"
      >
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">Dashboard</h1>
        <p className="max-w-3xl text-base text-muted-foreground sm:text-lg">
          {currentUser ? `${currentUser.name} · ` : ""}
          {workspace.name}
        </p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:gap-6 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <StatsCard key={stat.title} {...stat} index={index} />
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.2fr),minmax(320px,0.8fr)] lg:gap-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45, type: "spring" }}
          className="rounded-3xl border border-border/60 bg-card/90 p-6 shadow-sm backdrop-blur-sm sm:p-8"
        >
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-bold">Overview</h3>
            </div>

            <div className="rounded-2xl bg-success/15 px-4 py-2 text-sm font-bold text-success shadow-sm">
              {overallProgress}% complete
            </div>
          </div>

          <ProgressBar value={overallProgress} size="lg" label="Average completion" />

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/60 bg-background/50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Folders
              </p>
              <p className="mt-2 text-2xl font-semibold">{folders.length}</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Members
              </p>
              <p className="mt-2 text-2xl font-semibold">{members.length}</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Tracked
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {formatDurationCompact(totalTrackedTime)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55, type: "spring" }}
          className="space-y-6"
        >
          <div className="rounded-3xl border border-border/60 bg-card/90 p-6 shadow-sm backdrop-blur-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold">Inbox</h3>
              </div>
              <Button asChild variant="outline" className="rounded-2xl">
                <Link href="/settings">Settings</Link>
              </Button>
            </div>

            <div className="space-y-3">
              {inbox.slice(0, 4).map((notification) => (
                <Link
                  key={notification.id}
                  href={notification.href || "/dashboard"}
                  className="block rounded-2xl border border-border/60 bg-background/50 p-4 transition-colors hover:border-primary/30"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <Badge variant="outline" className="rounded-full">
                      {notification.title}
                    </Badge>
                    {!notification.read ? (
                      <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                    ) : null}
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {notification.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border/60 bg-card/90 p-6 shadow-sm backdrop-blur-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <MessageSquareMore className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold">Messages</h3>
              </div>
              <Button asChild variant="outline" className="rounded-2xl">
                <Link href="/projects">Projects</Link>
              </Button>
            </div>

            {projectSummaries.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/60 bg-background/50 p-4 text-sm text-muted-foreground">
                Create a project to start a chat.
              </div>
            ) : (
              <div className="space-y-3">
                {projectSummaries.slice(0, 3).map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}?panel=chat`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/50 p-4 transition-colors hover:border-primary/30"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{project.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Open project chat
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-primary">Open</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="mt-8 grid gap-6 lg:mt-10 lg:grid-cols-2 lg:gap-8">
        <motion.div
          initial={{ opacity: 0, y: 30, x: -20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6, type: "spring" }}
          className="rounded-3xl border border-border/60 bg-card/90 p-6 shadow-sm backdrop-blur-sm sm:p-8"
        >
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-bold">Projects</h3>
            </div>
            <Link
              href="/projects"
              className="text-sm font-semibold text-primary hover:underline underline-offset-4"
            >
              View all
            </Link>
          </div>

          {projectSummaries.length === 0 ? (
            <Empty className="rounded-3xl border border-dashed border-border/60 bg-background/40 px-6 py-10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FolderTree className="h-6 w-6" />
                </EmptyMedia>
                <EmptyTitle>No projects</EmptyTitle>
                <EmptyDescription>Create a project to start tracking work.</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button asChild className="rounded-2xl">
                  <Link href="/projects?create=1">Create a project</Link>
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="space-y-4">
              {projectSummaries.slice(0, 4).map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="block rounded-2xl border border-border/60 bg-background/50 p-5 transition-colors hover:border-primary/30"
                >
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <ProjectStatusBadge status={project.status} />
                        <Badge variant="outline" className="rounded-full">
                          {project.folder?.name ?? "Folder"}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-foreground">{project.name}</h4>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {project.completedTaskCount}/{project.totalTaskCount} tasks complete
                      </p>
                    </div>
                    <AssigneeStack
                      members={getAssignees(project.assigneeIds, members)}
                      size="sm"
                    />
                  </div>
                  <ProgressBar value={project.progress} size="sm" showPercentage={false} />
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          transition={{ duration: 0.5, delay: 0.7, type: "spring" }}
        >
          <ActivityFeed />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8, type: "spring" }}
        className="mt-8 rounded-3xl border border-border/60 bg-card/90 p-6 shadow-sm backdrop-blur-sm sm:p-8"
      >
        <div className="mb-6 flex items-center gap-3">
          <Timer className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-bold">Tracked time</h3>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {projectSummaries.slice(0, 3).map((project) => (
            <div
              key={project.id}
              className="rounded-2xl border border-border/60 bg-background/50 p-5"
            >
              <p className="font-semibold text-foreground">{project.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatDurationCompact(project.trackedTimeMs)} tracked
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </AppLayout>
  );
}
