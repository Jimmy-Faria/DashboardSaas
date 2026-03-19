"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  FolderKanban,
  ListTodo,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { StatsCard } from "@/components/dashboard/stats-card";
import { AppLayout } from "@/components/layout/app-layout";
import { ProtectedPageSkeleton } from "@/components/layout/protected-page-skeleton";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { useProjectStore } from "@/store/useProjectStore";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

export default function DashboardPage() {
  const hasMounted = useHasMounted();
  const tasks = useProjectStore((state) => state.tasks);
  const projects = useProjectStore((state) => state.projects);
  const currentUser = useProjectStore((state) => state.currentUser);
  const hasHydrated = useProjectStore((state) => state.hasHydrated);

  if (!hasMounted || !hasHydrated) {
    return <ProtectedPageSkeleton kind="dashboard" />;
  }

  const activeProjectIds = Array.from(new Set(tasks.map((task) => task.projectId)));
  const completedTasks = tasks.filter((task) => task.status === "done").length;
  const reviewTasks = tasks.filter((task) => task.status === "review").length;
  const inProgressTasks = tasks.filter(
    (task) => task.status === "in-progress"
  ).length;

  const getProjectProgress = (projectId: string) => {
    const projectTasks = tasks.filter((task) => task.projectId === projectId);

    if (projectTasks.length === 0) {
      return 0;
    }

    const doneTasks = projectTasks.filter((task) => task.status === "done").length;
    return Math.round((doneTasks / projectTasks.length) * 100);
  };

  const overallProgress = activeProjectIds.length
    ? Math.round(
        activeProjectIds.reduce(
          (total, projectId) => total + getProjectProgress(projectId),
          0
        ) / activeProjectIds.length
      )
    : 0;

  const activeProjects = projects
    .filter((project) => activeProjectIds.includes(project.id))
    .map((project) => {
      const projectTasks = tasks.filter((task) => task.projectId === project.id);
      const completed = projectTasks.filter((task) => task.status === "done").length;
      return {
        ...project,
        progress: getProjectProgress(project.id),
        completed,
        total: projectTasks.length,
      };
    })
    .sort((left, right) => right.progress - left.progress);

  const stats = [
    {
      title: "Active Projects",
      value: activeProjectIds.length,
      icon: FolderKanban,
      color: "primary" as const,
    },
    {
      title: "In Progress",
      value: inProgressTasks,
      icon: Clock,
      color: "warning" as const,
    },
    {
      title: "Completed",
      value: completedTasks,
      icon: CheckCircle2,
      color: "success" as const,
    },
    {
      title: "Pending Review",
      value: reviewTasks,
      icon: ListTodo,
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
        <div className="mb-2 flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
          >
            <Sparkles className="h-8 w-8 text-primary" />
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          {currentUser ? `Welcome back, ${currentUser.name}.` : "Welcome back."} All metrics are now driven by the global workspace state.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat, index) => (
          <StatsCard key={stat.title} {...stat} index={index} />
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5, type: "spring" }}
        whileHover={{ scale: 1.01 }}
        className="mt-10 rounded-3xl border border-border/60 bg-card/90 p-8 shadow-sm transition-shadow hover:shadow-lg backdrop-blur-sm"
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">Overall Progress</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Average progress across all active projects
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            className="flex items-center gap-2 rounded-2xl bg-success/15 px-4 py-2 shadow-sm"
          >
            <TrendingUp className="h-5 w-5 text-success" />
            <span className="text-sm font-bold text-success">{overallProgress}%</span>
          </motion.div>
        </div>
        <ProgressBar value={overallProgress} size="lg" label="Average completion" />
      </motion.div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 30, x: -20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6, type: "spring" }}
          className="rounded-3xl border border-border/60 bg-card/90 p-8 shadow-sm backdrop-blur-sm"
        >
          <div className="mb-8 flex items-center justify-between">
            <h3 className="text-xl font-bold">Active Projects</h3>
            <Link
              href="/projects"
              className="text-sm font-semibold text-primary hover:underline underline-offset-4"
            >
              View all
            </Link>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-5"
          >
            {activeProjects.map((project) => (
              <motion.div
                key={project.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                className="group"
              >
                <Link href={`/projects/${project.id}`}>
                  <div className="rounded-2xl border border-border/50 bg-background/50 p-5 transition-all hover:border-primary/30 hover:shadow-md backdrop-blur-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="font-semibold transition-colors group-hover:text-primary">
                        {project.name}
                      </h4>
                      <span className="rounded-full bg-muted/50 px-3 py-1 text-sm font-medium text-muted-foreground">
                        {project.completed}/{project.total} tasks
                      </span>
                    </div>
                    <ProgressBar
                      value={project.progress}
                      size="sm"
                      showPercentage={false}
                    />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          transition={{ duration: 0.5, delay: 0.7, type: "spring" }}
        >
          <ActivityFeed />
        </motion.div>
      </div>
    </AppLayout>
  );
}
