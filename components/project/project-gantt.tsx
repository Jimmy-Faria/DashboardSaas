"use client";

import { eachDayOfInterval, endOfWeek, format, startOfWeek } from "date-fns";
import { AssigneeStack } from "./assignee-stack";
import { ProjectStatusBadge } from "./project-status-badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDurationCompact, getAssignees, getSubtasks } from "@/lib/projectflow";
import { cn } from "@/lib/utils";
import type { ProjectTask, ProjectStatus, WorkspaceMember } from "@/store/useProjectStore";

interface ProjectGanttProps {
  tasks: ProjectTask[];
  members: WorkspaceMember[];
  projectStatus: ProjectStatus;
}

const statusBarClasses: Record<ProjectStatus, string> = {
  planning: "from-accent/60 to-accent",
  active: "from-primary/60 to-primary",
  "on-hold": "from-warning/60 to-warning",
  completed: "from-success/60 to-success",
};

export function ProjectGantt({
  tasks,
  members,
  projectStatus,
}: ProjectGanttProps) {
  const rootTasks = tasks.filter((task) => !task.parentTaskId);

  if (rootTasks.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border/60 bg-card/60 p-8 text-sm text-muted-foreground">
        No tasks.
      </div>
    );
  }

  const rangeStart = startOfWeek(
    rootTasks.reduce(
      (current, task) =>
        new Date(task.createdAt).getTime() < current.getTime()
          ? new Date(task.createdAt)
          : current,
      new Date(rootTasks[0].createdAt)
    ),
    { weekStartsOn: 1 }
  );

  const rangeEnd = endOfWeek(
    rootTasks.reduce(
      (current, task) =>
        new Date(task.dueDate).getTime() > current.getTime()
          ? new Date(task.dueDate)
          : current,
      new Date(rootTasks[0].dueDate)
    ),
    { weekStartsOn: 1 }
  );

  const timelineDays = eachDayOfInterval({ start: rangeStart, end: rangeEnd });
  const totalDays = Math.max(1, timelineDays.length - 1);

  return (
    <div className="rounded-[2rem] border border-border/60 bg-card/90 p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Timeline</h2>
        </div>
        <ProjectStatusBadge status={projectStatus} />
      </div>

      <ScrollArea className="w-full">
        <div className="min-w-[860px]">
          <div className="mb-3 grid grid-cols-[280px_minmax(560px,1fr)] gap-4">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Task
            </div>
            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${timelineDays.length}, minmax(32px, 1fr))`,
              }}
            >
              {timelineDays.map((day) => (
                <div
                  key={day.toISOString()}
                  className="text-center text-[0.7rem] font-medium text-muted-foreground"
                >
                  <p>{format(day, "d")}</p>
                  <p>{format(day, "MMM")}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {rootTasks.map((task) => {
              const taskStart = new Date(task.createdAt);
              const taskEnd = new Date(task.dueDate);
              const startOffset = Math.max(
                0,
                Math.floor(
                  (taskStart.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24)
                )
              );
              const taskSpan = Math.max(
                1,
                Math.ceil(
                  (taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24)
                )
              );
              const subtasks = getSubtasks(tasks, task.id);
              const taskAssignees = getAssignees(task.assigneeIds, members);

              return (
                <div
                  key={task.id}
                  className="grid grid-cols-[280px_minmax(560px,1fr)] gap-4 rounded-2xl border border-border/60 bg-background/40 p-4"
                >
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-foreground">{task.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {subtasks.length} sub-tasks · {formatDurationCompact(task.trackedTimeMs)}
                      </p>
                    </div>
                    <AssigneeStack members={taskAssignees} size="sm" />
                  </div>

                  <div className="relative">
                    <div
                      className="grid rounded-2xl"
                      style={{
                        gridTemplateColumns: `repeat(${timelineDays.length}, minmax(32px, 1fr))`,
                      }}
                    >
                      {timelineDays.map((day) => (
                        <div
                          key={day.toISOString()}
                          className="h-12 border-l border-border/40 last:border-r"
                        />
                      ))}
                    </div>

                    <div
                      className={cn(
                        "absolute top-1/2 h-6 -translate-y-1/2 rounded-full bg-gradient-to-r shadow-md",
                        statusBarClasses[projectStatus]
                      )}
                      style={{
                        left: `${(startOffset / totalDays) * 100}%`,
                        width: `${Math.min(100, (taskSpan / totalDays) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
