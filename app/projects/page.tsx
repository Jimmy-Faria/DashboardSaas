"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  FolderKanban,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { AppLayout } from "@/components/layout/app-layout";
import { ProtectedPageSkeleton } from "@/components/layout/protected-page-skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { useProjectStore } from "@/store/useProjectStore";

export default function ProjectsPage() {
  const hasMounted = useHasMounted();
  const projects = useProjectStore((state) => state.projects);
  const tasks = useProjectStore((state) => state.tasks);
  const currentUser = useProjectStore((state) => state.currentUser);
  const addProject = useProjectStore((state) => state.addProject);
  const hasHydrated = useProjectStore((state) => state.hasHydrated);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    dueDate: "2026-04-01",
  });

  if (!hasMounted || !hasHydrated) {
    return <ProtectedPageSkeleton kind="grid" />;
  }

  const projectCards = projects.map((project) => {
    const projectTasks = tasks.filter((task) => task.projectId === project.id);
    const completed = projectTasks.filter((task) => task.status === "done").length;
    const progress = projectTasks.length
      ? Math.round((completed / projectTasks.length) * 100)
      : 0;

    return {
      ...project,
      completed,
      total: projectTasks.length,
      progress,
      lastUpdated:
        projectTasks
          .sort(
            (left, right) =>
              new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
          )
          .at(0)?.updatedAt ?? project.createdAt,
    };
  });

  const handleCreateProject = () => {
    if (!form.name.trim()) {
      return;
    }

    addProject(
      {
        name: form.name,
        description: form.description,
        dueDate: new Date(form.dueDate).toISOString(),
        memberCount: currentUser ? 1 : 0,
      },
      currentUser?.name
    );
    toast.success("Project created!");
    setIsDialogOpen(false);
    setForm({
      name: "",
      description: "",
      dueDate: "2026-04-01",
    });
  };

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="mt-1 text-muted-foreground">
            Manage and track all your projects from the same global workspace state.
          </p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="rounded-2xl bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/25"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projectCards.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ y: -4 }}
            className="group"
          >
            <Link href={`/projects/${project.id}`}>
              <div className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-lg">
                <div className="mb-4 flex items-start justify-between">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10"
                  >
                    <FolderKanban className="h-6 w-6 text-primary" />
                  </motion.div>
                  <button
                    onClick={(event) => event.preventDefault()}
                    className="flex h-8 w-8 items-center justify-center rounded-lg opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
                  >
                    <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>

                <h3 className="mb-1 text-lg font-semibold transition-colors group-hover:text-primary">
                  {project.name}
                </h3>
                <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                  {project.description}
                </p>

                <ProgressBar value={project.progress} size="sm" className="mb-4" />

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>
                      {project.completed}/{project.total} tasks
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                      }).format(new Date(project.lastUpdated))}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-[2rem] border-border/60 bg-card/95 p-0 shadow-2xl backdrop-blur-2xl sm:max-w-xl">
          <div className="p-8">
            <DialogHeader className="mb-6 space-y-2 text-left">
              <DialogTitle className="text-2xl">Create Project</DialogTitle>
              <DialogDescription>
                Projects are added to the global store, so they appear immediately across the dashboard and board pages.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Name</label>
                <Input
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  className="h-12 rounded-2xl border-border/60 bg-background/50"
                  placeholder="e.g. Customer Portal"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Description</label>
                <Textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  className="min-h-28 rounded-2xl border-border/60 bg-background/50"
                  placeholder="Describe the project outcome and scope."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Due date</label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, dueDate: event.target.value }))
                  }
                  className="h-12 rounded-2xl border-border/60 bg-background/50"
                />
              </div>
            </div>

            <DialogFooter className="mt-8">
              <Button
                variant="outline"
                className="rounded-2xl"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="rounded-2xl bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/25"
                onClick={handleCreateProject}
                disabled={!form.name.trim()}
              >
                Create Project
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
