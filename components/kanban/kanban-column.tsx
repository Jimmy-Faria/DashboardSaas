"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { TaskCard } from "./task-card";
import { cn } from "@/lib/utils";
import type {
  ProjectTask,
  TaskStatus,
  WorkspaceMember,
} from "@/store/useProjectStore";

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: ProjectTask[];
  members: WorkspaceMember[];
  color: "muted" | "primary" | "warning" | "success";
  getSubtaskCount?: (taskId: string) => number;
  onToggleTimer?: (taskId: string) => void;
  onAddTask?: () => void;
  onDragOver?: (event: React.DragEvent) => void;
  onDrop?: (event: React.DragEvent) => void;
  onTaskDragStart?: (task: ProjectTask, sourceColumn: TaskStatus) => void;
  onTaskDragEnd?: () => void;
  onTaskOpen?: (task: ProjectTask) => void;
  draggedTaskId?: string | null;
  index?: number;
}

const columnColors = {
  muted: {
    header: "bg-muted/60 backdrop-blur-sm",
    dot: "bg-muted-foreground",
    border: "border-muted-foreground/20",
  },
  primary: {
    header: "bg-primary/15 backdrop-blur-sm",
    dot: "bg-primary",
    border: "border-primary/30",
  },
  warning: {
    header: "bg-warning/15 backdrop-blur-sm",
    dot: "bg-warning",
    border: "border-warning/30",
  },
  success: {
    header: "bg-success/15 backdrop-blur-sm",
    dot: "bg-success",
    border: "border-success/30",
  },
};

export function KanbanColumn({
  id,
  title,
  tasks,
  members,
  color,
  getSubtaskCount,
  onToggleTimer,
  onAddTask,
  onDragOver,
  onDrop,
  onTaskDragStart,
  onTaskDragEnd,
  onTaskOpen,
  draggedTaskId,
  index = 0,
}: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false);
  const colors = columnColors[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        type: "spring",
        stiffness: 100,
        damping: 15,
      }}
      className={cn(
        "flex h-full w-[340px] flex-shrink-0 flex-col rounded-2xl border bg-muted/30 backdrop-blur-sm",
        colors.border
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between rounded-t-2xl px-5 py-4",
          colors.header
        )}
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }}
            className={cn("h-3 w-3 rounded-full shadow-lg", colors.dot)}
          />
          <h3 className="font-bold text-foreground">{title}</h3>
          <span className="rounded-full bg-background/80 px-2.5 py-1 text-xs font-bold text-muted-foreground shadow-sm backdrop-blur-sm">
            {tasks.length}
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          onClick={onAddTask}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-background/80 text-muted-foreground shadow-sm transition-colors hover:bg-card hover:text-foreground hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
        </motion.button>
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsOver(true);
          onDragOver?.(event);
        }}
        onDragLeave={() => setIsOver(false)}
        onDrop={(event) => {
          setIsOver(false);
          onDrop?.(event);
        }}
        className={cn(
          "flex-1 space-y-4 overflow-y-auto p-4 transition-all duration-300",
          isOver && "scale-[1.01] bg-primary/5"
        )}
      >
        <AnimatePresence mode="popLayout">
          {tasks.map((task, taskIndex) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: taskIndex * 0.05,
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
            >
              <TaskCard
                task={task}
                members={members}
                subtaskCount={getSubtaskCount?.(task.id) ?? 0}
                isDragging={draggedTaskId === task.id}
                onDragStart={() => onTaskDragStart?.(task, id)}
                onDragEnd={onTaskDragEnd}
                onToggleTimer={() => onToggleTimer?.(task.id)}
                onOpen={() => onTaskOpen?.(task)}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {tasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="rounded-2xl border border-dashed border-border/50 bg-background/60 px-5 py-4 text-sm text-muted-foreground shadow-sm backdrop-blur-sm">
              No tasks
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {isOver && (
            <motion.div
              initial={{ opacity: 0, scaleY: 0, height: 0 }}
              animate={{ opacity: 1, scaleY: 1, height: 80 }}
              exit={{ opacity: 0, scaleY: 0, height: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="rounded-2xl border-2 border-dashed border-primary/40 bg-primary/10 backdrop-blur-sm"
            />
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 pt-0">
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          onClick={onAddTask}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border/60 bg-background/50 py-3 text-sm font-semibold text-muted-foreground transition-all hover:border-primary/50 hover:bg-background/80 hover:text-foreground hover:shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add task
        </motion.button>
      </div>
    </motion.div>
  );
}
