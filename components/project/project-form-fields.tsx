"use client";

import { MemberPicker } from "@/components/project/member-picker";
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
  projectStatusOptions,
  type Folder,
  type ProjectStatus,
  type TaskPriority,
  type WorkspaceMember,
} from "@/store/useProjectStore";

export interface ProjectFormValues {
  folderId: string;
  name: string;
  description: string;
  category: string;
  dueDate: string;
  status: ProjectStatus;
  progress: number;
  priority: TaskPriority;
  budget: string;
  tags: string;
  assigneeIds: string[];
}

interface ProjectFormFieldsProps {
  form: ProjectFormValues;
  folders: Folder[];
  members: WorkspaceMember[];
  onChange: (updater: (current: ProjectFormValues) => ProjectFormValues) => void;
}

export function ProjectFormFields({
  form,
  folders,
  members,
  onChange,
}: ProjectFormFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold">Name</label>
          <Input
            value={form.name}
            onChange={(event) =>
              onChange((current) => ({ ...current, name: event.target.value }))
            }
            className="h-12 rounded-2xl border-border/60 bg-background/50"
            placeholder="Project name"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">Folder</label>
          <Select
            value={form.folderId || undefined}
            onValueChange={(value) =>
              onChange((current) => ({ ...current, folderId: value }))
            }
          >
            <SelectTrigger className="h-12 rounded-2xl border-border/60 bg-background/50">
              <SelectValue placeholder="Folder" />
            </SelectTrigger>
            <SelectContent>
              {folders.map((folder) => (
                <SelectItem key={folder.id} value={folder.id}>
                  {folder.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold">Description</label>
        <Textarea
          value={form.description}
          onChange={(event) =>
            onChange((current) => ({ ...current, description: event.target.value }))
          }
          className="min-h-24 rounded-2xl border-border/60 bg-background/50"
          placeholder="Notes"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold">Category</label>
          <Input
            value={form.category}
            onChange={(event) =>
              onChange((current) => ({ ...current, category: event.target.value }))
            }
            className="h-12 rounded-2xl border-border/60 bg-background/50"
            placeholder="Category"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">Priority</label>
          <Select
            value={form.priority}
            onValueChange={(value) =>
              onChange((current) => ({
                ...current,
                priority: value as TaskPriority,
              }))
            }
          >
            <SelectTrigger className="h-12 rounded-2xl border-border/60 bg-background/50">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold">Due date</label>
          <Input
            type="date"
            value={form.dueDate}
            onChange={(event) =>
              onChange((current) => ({ ...current, dueDate: event.target.value }))
            }
            className="h-12 rounded-2xl border-border/60 bg-background/50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">Status</label>
          <Select
            value={form.status}
            onValueChange={(value) =>
              onChange((current) => ({
                ...current,
                status: value as ProjectStatus,
              }))
            }
          >
            <SelectTrigger className="h-12 rounded-2xl border-border/60 bg-background/50">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {projectStatusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-semibold">Progress</label>
          <Input
            type="number"
            min="0"
            max="100"
            step="5"
            value={form.progress}
            onChange={(event) =>
              onChange((current) => ({
                ...current,
                progress: Number(event.target.value || 0),
              }))
            }
            className="h-12 rounded-2xl border-border/60 bg-background/50"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-semibold">Budget</label>
          <Input
            type="number"
            min="0"
            step="100"
            value={form.budget}
            onChange={(event) =>
              onChange((current) => ({ ...current, budget: event.target.value }))
            }
            className="h-12 rounded-2xl border-border/60 bg-background/50"
            placeholder="12000"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold">Tags</label>
        <Input
          value={form.tags}
          onChange={(event) =>
            onChange((current) => ({ ...current, tags: event.target.value }))
          }
          className="h-12 rounded-2xl border-border/60 bg-background/50"
          placeholder="design, mobile"
        />
      </div>

      <div className="space-y-3">
        <label className="text-sm font-semibold">Assignees</label>
        <MemberPicker
          members={members}
          selectedIds={form.assigneeIds}
          onToggle={(memberId) =>
            onChange((current) => ({
              ...current,
              assigneeIds: current.assigneeIds.includes(memberId)
                ? current.assigneeIds.filter((id) => id !== memberId)
                : [...current.assigneeIds, memberId],
            }))
          }
        />
      </div>
    </div>
  );
}
