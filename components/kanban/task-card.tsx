"use client";

import { motion } from "framer-motion";
import { Calendar, GripVertical, User2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectTask } from "@/store/useProjectStore";

interface TaskCardProps {
  task: ProjectTask;
  isDragging?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

const priorityConfig = {
  low: {
    label: "Low",
    bg: "bg-success/15",
    text: "text-success",
    border: "border-success/30",
    glow: "shadow-success/10",
  },
  medium: {
    label: "Medium",
    bg: "bg-warning/15",
    text: "text-warning",
    border: "border-warning/30",
    glow: "shadow-warning/10",
  },
  high: {
    label: "High",
    bg: "bg-destructive/15",
    text: "text-destructive",
    border: "border-destructive/30",
    glow: "shadow-destructive/10",
  },
};

export function TaskCard({
  task,
  isDragging = false,
  onDragStart,
  onDragEnd,
}: TaskCardProps) {
  const priority = priorityConfig[task.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{
        opacity: 1,
        scale: isDragging ? 1.05 : 1,
        y: 0,
        rotate: isDragging ? 3 : 0,
        boxShadow: isDragging
          ? "0 25px 50px -12px rgba(0,0,0,0.25)"
          : "0 1px 3px rgba(0,0,0,0.05)",
      }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      whileHover={{
        y: -4,
        scale: 1.02,
        boxShadow: "0 20px 40px -12px rgba(0,0,0,0.15)",
      }}
      whileTap={{ scale: 0.98 }}
      transition={{
        layout: { type: "spring", stiffness: 300, damping: 20 },
        scale: { type: "spring", stiffness: 400, damping: 25 },
        y: { type: "spring", stiffness: 300, damping: 20 },
      }}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "group cursor-grab rounded-2xl border border-border/60 bg-card/90 backdrop-blur-sm p-5 transition-colors active:cursor-grabbing",
        isDragging && "z-50 border-primary/50 ring-2 ring-primary/20"
      )}
    >
      {/* Drag Handle */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex h-6 items-center opacity-0 group-hover:opacity-60 transition-opacity"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </motion.div>
        <motion.span
          whileHover={{ scale: 1.05, y: -1 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border shadow-sm",
            priority.bg,
            priority.text,
            priority.border,
            priority.glow
          )}
        >
          {priority.label}
        </motion.span>
      </div>

      {/* Title */}
      <h4 className="mb-2 font-semibold leading-snug text-card-foreground">
        {task.title}
      </h4>

      {/* Description */}
      {task.description && (
        <p className="mb-4 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border/40">
        {task.dueDate && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span className="font-medium">
              {new Intl.DateTimeFormat("en-US", {
                month: "short",
                day: "numeric",
              }).format(new Date(task.dueDate))}
            </span>
          </div>
        )}
        {task.assignee && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
              <User2 className="h-3 w-3 text-primary" />
            </div>
            <span className="font-medium">{task.assignee}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
