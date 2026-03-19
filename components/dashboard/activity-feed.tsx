"use client";

import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { CheckCircle2, Clock3, FolderPlus, Trash2, Workflow } from "lucide-react";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { cn } from "@/lib/utils";
import { useProjectStore } from "@/store/useProjectStore";

const iconMap = {
  "task-created": Workflow,
  "task-moved": CheckCircle2,
  "project-created": FolderPlus,
  "task-deleted": Trash2,
};

const colorMap = {
  "task-created": "text-primary bg-primary/15",
  "task-moved": "text-success bg-success/15",
  "project-created": "text-warning bg-warning/15",
  "task-deleted": "text-destructive bg-destructive/15",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

export function ActivityFeed() {
  const hasMounted = useHasMounted();
  const activities = useProjectStore((state) => state.activityLog);
  const hasHydrated = useProjectStore((state) => state.hasHydrated);

  if (!hasMounted || !hasHydrated) {
    return (
      <div className="h-full rounded-3xl border border-border/60 bg-card/90 p-8 shadow-sm backdrop-blur-sm">
        <div className="mb-8 flex items-center justify-between">
          <h3 className="text-xl font-bold">Recent Activity</h3>
        </div>

        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-16 animate-pulse rounded-2xl bg-background/60"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full rounded-3xl border border-border/60 bg-card/90 p-8 shadow-sm backdrop-blur-sm">
      <div className="mb-8 flex items-center justify-between">
        <h3 className="text-xl font-bold">Recent Activity</h3>
        <button className="text-sm font-semibold text-primary hover:underline underline-offset-4">
          View all
        </button>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-5"
      >
        {activities.slice(0, 5).map((activity) => {
          const Icon = iconMap[activity.type];
          const colors = colorMap[activity.type];

          return (
            <motion.div
              key={activity.id}
              variants={itemVariants}
              whileHover={{ x: 6, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="group flex cursor-pointer items-start gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.15, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className={cn(
                  "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl shadow-sm",
                  colors
                )}
              >
                <Icon className="h-5 w-5" />
              </motion.div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-snug transition-colors group-hover:text-primary">
                  {activity.title}
                </p>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {activity.description}
                </p>
              </div>

              <div className="flex-shrink-0 text-right">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Clock3 className="h-3 w-3" />
                  {formatDistanceToNow(new Date(activity.createdAt), {
                    addSuffix: true,
                  })}
                </div>
                <p className="mt-1 text-xs font-medium text-muted-foreground/80">
                  by {activity.actor}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
