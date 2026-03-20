"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Save, Trash2 } from "lucide-react";
import { MemberPicker } from "@/components/project/member-picker";
import { TimeTrackerChip } from "@/components/project/time-tracker-chip";
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
import {
  useProjectStore,
  type ProjectTask,
  type TaskPriority,
  type TaskStatus,
  type WorkspaceMember,
} from "@/store/useProjectStore";

const priorityOptions: TaskPriority[] = ["low", "medium", "high"];
const statusOptions: TaskStatus[] = ["todo", "in-progress", "review", "done"];

interface TaskDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: ProjectTask | null;
  members: WorkspaceMember[];
}

export function TaskDetailDialog({
  open,
  onOpenChange,
  task,
  members,
}: TaskDetailDialogProps) {
  const updateTask = useProjectStore((state) => state.updateTask);
  const deleteTask = useProjectStore((state) => state.deleteTask);
  const toggleTaskTimer = useProjectStore((state) => state.toggleTaskTimer);
  const currentUser = useProjectStore((state) => state.currentUser);
  const [draft, setDraft] = useState({
    title: "",
    description: "",
    priority: "medium" as TaskPriority,
    status: "todo" as TaskStatus,
    dueDate: "",
    assigneeIds: [] as string[],
  });

  useEffect(() => {
    if (!task) {
      return;
    }

    setDraft({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate.slice(0, 10),
      assigneeIds: task.assigneeIds,
    });
  }, [task]);

  if (!task) {
    return null;
  }

  const handleSave = () => {
    if (!draft.title.trim()) {
      return;
    }

    updateTask(
      task.id,
      {
        title: draft.title,
        description: draft.description,
        priority: draft.priority,
        status: draft.status,
        dueDate: draft.dueDate
          ? new Date(`${draft.dueDate}T12:00:00`).toISOString()
          : task.dueDate,
        assigneeIds: draft.assigneeIds,
      },
      currentUser?.name
    );
    onOpenChange(false);
  };

  const handleDelete = () => {
    deleteTask(task.id, currentUser?.name);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto rounded-[2rem] border-border/70 bg-card/95 p-0 shadow-2xl backdrop-blur-2xl sm:max-w-3xl">
        <div className="p-8">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-2xl">Task detail</DialogTitle>
            <DialogDescription className="sr-only">Review and update the task.</DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Title</label>
              <Input
                value={draft.title}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, title: event.target.value }))
                }
                className="h-12 rounded-2xl border-border/60 bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Description</label>
              <Textarea
                value={draft.description}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                className="min-h-32 rounded-2xl border-border/60 bg-background/50"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Status</label>
                <Select
                  value={draft.status}
                  onValueChange={(value) =>
                    setDraft((current) => ({
                      ...current,
                      status: value as TaskStatus,
                    }))
                  }
                >
                  <SelectTrigger className="h-12 rounded-2xl border-border/60 bg-background/50">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replace("-", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Priority</label>
                <Select
                  value={draft.priority}
                  onValueChange={(value) =>
                    setDraft((current) => ({
                      ...current,
                      priority: value as TaskPriority,
                    }))
                  }
                >
                  <SelectTrigger className="h-12 rounded-2xl border-border/60 bg-background/50">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Due date</label>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="date"
                    value={draft.dueDate}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        dueDate: event.target.value,
                      }))
                    }
                    className="h-12 rounded-2xl border-border/60 bg-background/50 pr-11"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-semibold">Assignees</label>
                <TimeTrackerChip
                  trackedTimeMs={task.trackedTimeMs}
                  isRunning={Boolean(task.timerStartedAt)}
                  onToggle={() => toggleTaskTimer(task.id, currentUser?.id)}
                />
              </div>

              <MemberPicker
                members={members}
                selectedIds={draft.assigneeIds}
                onToggle={(memberId) =>
                  setDraft((current) => ({
                    ...current,
                    assigneeIds: current.assigneeIds.includes(memberId)
                      ? current.assigneeIds.filter((id) => id !== memberId)
                      : [...current.assigneeIds, memberId],
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter className="mt-8 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleDelete}
              className="rounded-2xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="rounded-2xl"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                className="rounded-2xl bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/25"
              >
                <Save className="h-4 w-4" />
                Save task
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
