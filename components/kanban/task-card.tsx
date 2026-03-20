"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Calendar, GripVertical, Layers3 } from "lucide-react";
import { AssigneeStack } from "@/components/project/assignee-stack";
import { TimeTrackerChip } from "@/components/project/time-tracker-chip";
import { getAssignees } from "@/lib/projectflow";
import { cn } from "@/lib/utils";
import type { ProjectTask, WorkspaceMember } from "@/store/useProjectStore";

interface TaskCardProps {
  task: ProjectTask;
  members: WorkspaceMember[];
  subtaskCount?: number;
  isDragging?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onToggleTimer?: () => void;
  onOpen?: () => void;
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
  members,
  subtaskCount = 0,
  isDragging = false,
  onDragStart,
  onDragEnd,
  onToggleTimer,
  onOpen,
}: TaskCardProps) {
  const priority = priorityConfig[task.priority];
  const assignees = getAssignees(task.assigneeIds, members);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const didDragRef = useRef(false);

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
      onPointerDown={(event) => {
        pointerStartRef.current = { x: event.clientX, y: event.clientY };
      }}
      onPointerUp={(event) => {
        if (!onOpen || didDragRef.current || !pointerStartRef.current) {
          pointerStartRef.current = null;
          return;
        }

        const deltaX = Math.abs(event.clientX - pointerStartRef.current.x);
        const deltaY = Math.abs(event.clientY - pointerStartRef.current.y);

        if (deltaX < 6 && deltaY < 6) {
          onOpen();
        }

        pointerStartRef.current = null;
      }}
      onDragStart={() => {
        didDragRef.current = true;
        onDragStart?.();
      }}
      onDragEnd={() => {
        onDragEnd?.();
        requestAnimationFrame(() => {
          didDragRef.current = false;
        });
      }}
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

      <div className="space-y-3 border-t border-border/40 pt-3">
        <div className="flex items-center justify-between gap-3">
          {task.dueDate ? (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span className="font-medium">
                {new Intl.DateTimeFormat("en-US", {
                  month: "short",
                  day: "numeric",
                }).format(new Date(task.dueDate))}
              </span>
            </div>
          ) : (
            <span />
          )}

          {subtaskCount > 0 ? (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Layers3 className="h-3.5 w-3.5" />
              <span className="font-medium">{subtaskCount} subtasks</span>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3">
          <AssigneeStack members={assignees} max={3} size="sm" />
          <div
            onClick={(event) => event.stopPropagation()}
            onPointerUp={(event) => event.stopPropagation()}
          >
            <TimeTrackerChip
              trackedTimeMs={task.trackedTimeMs}
              isRunning={Boolean(task.timerStartedAt)}
              onToggle={onToggleTimer}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
