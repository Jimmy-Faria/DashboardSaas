"use client";

import Link from "next/link";
import { use } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MoreHorizontal, Users } from "lucide-react";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { AppLayout } from "@/components/layout/app-layout";
import { ProtectedPageSkeleton } from "@/components/layout/protected-page-skeleton";
import { Button } from "@/components/ui/button";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { useProjectStore } from "@/store/useProjectStore";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const hasMounted = useHasMounted();
  const projects = useProjectStore((state) => state.projects);
  const tasks = useProjectStore((state) => state.tasks);
  const hasHydrated = useProjectStore((state) => state.hasHydrated);
  const project = projects.find((item) => item.id === id);

  if (!hasMounted || !hasHydrated) {
    return <ProtectedPageSkeleton kind="board" />;
  }

  if (!project) {
    return (
      <AppLayout>
        <div className="rounded-3xl border border-border/60 bg-card/90 p-8 shadow-sm backdrop-blur-sm">
          <h1 className="text-2xl font-bold">Project not found</h1>
          <p className="mt-2 text-muted-foreground">
            This project does not exist in the current persisted workspace state.
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

  const projectTasks = tasks.filter((task) => task.projectId === project.id);
  const completedTasks = projectTasks.filter((task) => task.status === "done").length;
  const progress = projectTasks.length
    ? Math.round((completedTasks / projectTasks.length) * 100)
    : 0;

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <Link
          href="/projects"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              {project.description}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{project.memberCount} team members</span>
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
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <MoreHorizontal className="mr-2 h-4 w-4" />
              Options
            </Button>
            <Button size="sm">Share</Button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-6 rounded-2xl border border-border bg-card p-4"
        >
          <ProgressBar value={progress} label="Overall Progress" size="md" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <KanbanBoard projectId={project.id} />
      </motion.div>
    </AppLayout>
  );
}
