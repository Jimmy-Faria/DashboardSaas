"use client";

import { useMemo, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { KanbanColumn } from "./kanban-column";
import { MemberPicker } from "@/components/project/member-picker";
import { TaskDetailDialog } from "@/components/project/task-detail-dialog";
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
import { formatDurationCompact, getRootTasks, getSubtasks } from "@/lib/projectflow";
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
  const members = useProjectStore((state) => state.members);
  const addTask = useProjectStore((state) => state.addTask);
  const updateTaskStatus = useProjectStore((state) => state.updateTaskStatus);
  const toggleTaskTimer = useProjectStore((state) => state.toggleTaskTimer);
  const currentUser = useProjectStore((state) => state.currentUser);
  const hasHydrated = useProjectStore((state) => state.hasHydrated);
  const currentMember = members.find(
    (member) =>
      member.userId === currentUser?.id ||
      member.email.toLowerCase() === currentUser?.email?.toLowerCase()
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [newTaskColumn, setNewTaskColumn] = useState<TaskStatus>("todo");
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as TaskPriority,
    parentTaskId: "none",
    assigneeIds: currentMember?.id ? [currentMember.id] : [],
  });
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const dragRef = useRef<{
    taskId: string;
    sourceStatus: TaskStatus;
  } | null>(null);
  const dropTargetRef = useRef<TaskStatus | null>(null);

  const projectTasks = useMemo(
    () => tasks.filter((task) => task.projectId === projectId),
    [projectId, tasks]
  );
  const selectedTask = projectTasks.find((task) => task.id === selectedTaskId) ?? null;

  const rootTasks = useMemo(
    () => getRootTasks(tasks, projectId),
    [projectId, tasks]
  );

  const groupedTasks = useMemo(
    () =>
      columns.reduce<Record<TaskStatus, ProjectTask[]>>(
        (accumulator, column) => {
          accumulator[column.id] = rootTasks.filter(
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
      ),
    [rootTasks]
  );

  const openNewTaskModal = (status: TaskStatus = "todo") => {
    setNewTaskColumn(status);
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      parentTaskId: "none",
      assigneeIds: currentMember?.id ? [currentMember.id] : [],
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
      toast.success("Task moved.");
    }

    dragRef.current = null;
    dropTargetRef.current = null;
    setDraggedTaskId(null);
  };

  const handleCreateTask = () => {
    if (!newTask.title.trim()) {
      return;
    }

    addTask(
      {
        projectId,
        parentTaskId:
          newTask.parentTaskId === "none" ? null : newTask.parentTaskId,
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        status: newTaskColumn,
        assigneeIds: newTask.assigneeIds,
      },
      currentUser?.name
    );

    toast.success(
      newTask.parentTaskId === "none" ? "Task created." : "Sub-task created."
    );
    setIsModalOpen(false);
  };

  const totalTrackedTime = projectTasks.reduce(
    (total, task) => total + task.trackedTimeMs,
    0
  );

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
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="rounded-2xl border border-border/60 bg-card/80 px-4 py-2 text-sm text-muted-foreground shadow-sm">
            {formatDurationCompact(totalTrackedTime)} tracked
          </div>
          <Button
            onClick={() => openNewTaskModal("todo")}
            className="rounded-2xl bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/25"
          >
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>
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
              members={members}
              color={column.color}
              index={index}
              draggedTaskId={draggedTaskId}
              getSubtaskCount={(taskId) => getSubtasks(projectTasks, taskId).length}
              onToggleTimer={(taskId) => toggleTaskTimer(taskId, currentMember?.id)}
              onAddTask={() => openNewTaskModal(column.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleDrop(column.id)}
              onTaskDragStart={handleTaskDragStart}
              onTaskDragEnd={handleDragEnd}
              onTaskOpen={(task) => setSelectedTaskId(task.id)}
            />
          </div>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="rounded-[2rem] border-border/60 bg-card/95 p-0 shadow-2xl backdrop-blur-2xl sm:max-w-3xl">
          <div className="p-8">
            <DialogHeader className="mb-6 space-y-2 text-left">
              <DialogTitle className="text-2xl">New task</DialogTitle>
              <DialogDescription className="sr-only">Set task details.</DialogDescription>
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
                  placeholder="Task title"
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
                  placeholder="Notes"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
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
                      <SelectValue placeholder="Priority" />
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
                      <SelectValue placeholder="Column" />
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

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Parent task</label>
                  <Select
                    value={newTask.parentTaskId}
                    onValueChange={(value) =>
                      setNewTask((prev) => ({ ...prev, parentTaskId: value }))
                    }
                  >
                    <SelectTrigger className="h-12 w-full rounded-2xl border-border/60 bg-background/50">
                      <SelectValue placeholder="No parent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No parent</SelectItem>
                      {rootTasks.map((task) => (
                        <SelectItem key={task.id} value={task.id}>
                          {task.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Assignees</label>
                <MemberPicker
                  members={members}
                  selectedIds={newTask.assigneeIds}
                  onToggle={(memberId) =>
                    setNewTask((prev) => ({
                      ...prev,
                      assigneeIds: prev.assigneeIds.includes(memberId)
                        ? prev.assigneeIds.filter((id) => id !== memberId)
                        : [...prev.assigneeIds, memberId],
                    }))
                  }
                />
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
                Create
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <TaskDetailDialog
        open={Boolean(selectedTask)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTaskId(null);
          }
        }}
        task={selectedTask}
        members={members}
      />
    </>
  );
}
