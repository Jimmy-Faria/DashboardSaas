"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { KanbanColumn } from "./kanban-column";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useHasMounted } from "@/hooks/use-has-mounted";
import {
  useProjectStore,
  type ProjectTask,
  type TaskPriority,
  type TaskStatus,
} from "@/store/useProjectStore";

interface Column {
  id: TaskStatus;
  title: string;
  color: "muted" | "primary" | "warning" | "success";
}

const columns: Column[] = [
  { id: "todo", title: "To Do", color: "muted" },
  { id: "in-progress", title: "In Progress", color: "primary" },
  { id: "review", title: "Review", color: "warning" },
  { id: "done", title: "Done", color: "success" },
];

interface KanbanBoardProps {
  projectId: string;
}

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const hasMounted = useHasMounted();
  const tasks = useProjectStore((state) => state.tasks);
  const addTask = useProjectStore((state) => state.addTask);
  const updateTaskStatus = useProjectStore((state) => state.updateTaskStatus);
  const currentUser = useProjectStore((state) => state.currentUser);
  const hasHydrated = useProjectStore((state) => state.hasHydrated);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskColumn, setNewTaskColumn] = useState<TaskStatus>("todo");
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as TaskPriority,
  });
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const dragRef = useRef<{
    taskId: string;
    sourceStatus: TaskStatus;
  } | null>(null);
  const dropTargetRef = useRef<TaskStatus | null>(null);

  const projectTasks = tasks.filter((task) => task.projectId === projectId);

  const groupedTasks = columns.reduce<Record<TaskStatus, ProjectTask[]>>(
    (accumulator, column) => {
      accumulator[column.id] = projectTasks.filter(
        (task) => task.status === column.id
      );
      return accumulator;
    },
    {
      todo: [],
      "in-progress": [],
      review: [],
      done: [],
    }
  );

  const openNewTaskModal = (status: TaskStatus = "todo") => {
    setNewTaskColumn(status);
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
    });
    setIsModalOpen(true);
  };

  const handleTaskDragStart = (task: ProjectTask, sourceStatus: TaskStatus) => {
    dragRef.current = {
      taskId: task.id,
      sourceStatus,
    };
    dropTargetRef.current = null;
    setDraggedTaskId(task.id);
  };

  const handleDrop = (targetStatus: TaskStatus) => {
    dropTargetRef.current = targetStatus;
  };

  const handleDragEnd = () => {
    const dragState = dragRef.current;
    const targetStatus = dropTargetRef.current;

    if (dragState && targetStatus && dragState.sourceStatus !== targetStatus) {
      updateTaskStatus(dragState.taskId, targetStatus, currentUser?.name);
      toast.success("Task moved!");
    }

    dragRef.current = null;
    dropTargetRef.current = null;
    setDraggedTaskId(null);
  };

  const handleCreateTask = () => {
    if (!newTask.title.trim()) {
      return;
    }

    addTask({
      projectId,
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      status: newTaskColumn,
      assignee: currentUser?.name,
    });

    toast.success("Task created!");
    setIsModalOpen(false);
  };

  if (!hasMounted || !hasHydrated) {
    return (
      <div className="grid gap-6 xl:grid-cols-4">
        {columns.map((column) => (
          <div
            key={column.id}
            className="min-h-[22rem] rounded-3xl border border-border/50 bg-card/70 p-5"
          >
            <div className="mb-5 h-8 w-32 animate-pulse rounded-2xl bg-muted/70" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-28 animate-pulse rounded-2xl bg-background/60"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Task Board</h2>
          <p className="text-sm text-muted-foreground">
            Move cards across the flow and the dashboard will react instantly.
          </p>
        </div>

        <Button
          onClick={() => openNewTaskModal("todo")}
          className="rounded-2xl bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/25"
        >
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </div>

      <div className="flex gap-6 overflow-x-auto px-1 pb-6">
        {columns.map((column, index) => (
          <div
            key={column.id}
            draggable={false}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => handleDrop(column.id)}
          >
            <KanbanColumn
              id={column.id}
              title={column.title}
              tasks={groupedTasks[column.id]}
              color={column.color}
              index={index}
              draggedTaskId={draggedTaskId}
              onAddTask={() => openNewTaskModal(column.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleDrop(column.id)}
              onTaskDragStart={handleTaskDragStart}
              onTaskDragEnd={handleDragEnd}
            />
          </div>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="rounded-[2rem] border-border/60 bg-card/95 p-0 shadow-2xl backdrop-blur-2xl sm:max-w-xl">
          <div className="p-8">
            <DialogHeader className="mb-6 space-y-2 text-left">
              <DialogTitle className="text-2xl">Create New Task</DialogTitle>
              <DialogDescription>
                Insert the title, priority, and description, then choose the column where this task should start.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Title</label>
                <Input
                  value={newTask.title}
                  onChange={(event) =>
                    setNewTask((prev) => ({ ...prev, title: event.target.value }))
                  }
                  className="h-12 rounded-2xl border-border/60 bg-background/50"
                  placeholder="e.g. Implement onboarding checklist"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Description</label>
                <Textarea
                  value={newTask.description}
                  onChange={(event) =>
                    setNewTask((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  className="min-h-28 rounded-2xl border-border/60 bg-background/50"
                  placeholder="Add context, acceptance criteria, or implementation notes."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Priority</label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value) =>
                      setNewTask((prev) => ({
                        ...prev,
                        priority: value as TaskPriority,
                      }))
                    }
                  >
                    <SelectTrigger className="h-12 w-full rounded-2xl border-border/60 bg-background/50">
                      <SelectValue placeholder="Choose priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Column</label>
                  <Select
                    value={newTaskColumn}
                    onValueChange={(value) => setNewTaskColumn(value as TaskStatus)}
                  >
                    <SelectTrigger className="h-12 w-full rounded-2xl border-border/60 bg-background/50">
                      <SelectValue placeholder="Choose column" />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((column) => (
                        <SelectItem key={column.id} value={column.id}>
                          {column.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-8">
              <Button
                variant="outline"
                className="rounded-2xl"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="rounded-2xl bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/25"
                onClick={handleCreateTask}
                disabled={!newTask.title.trim()}
              >
                Create Task
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
