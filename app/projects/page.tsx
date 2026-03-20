"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { addDays, format } from "date-fns";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Calendar,
  FolderKanban,
  Layers3,
  MessageSquareMore,
  MoreHorizontal,
  PencilLine,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { AppLayout } from "@/components/layout/app-layout";
import { ProtectedPageSkeleton } from "@/components/layout/protected-page-skeleton";
import {
  ProjectFormFields,
  type ProjectFormValues,
} from "@/components/project/project-form-fields";
import { ProjectStatusBadge } from "@/components/project/project-status-badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import {
  formatDurationCompact,
  getProjectSummaries,
} from "@/lib/projectflow";
import { useProjectStore, type Project } from "@/store/useProjectStore";

const PAGE_SIZE = 6;
const toIsoDate = (date: string) => new Date(`${date}T12:00:00`).toISOString();
const parseBudget = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};
const parseTags = (value: string, category: string) =>
  Array.from(
    new Set(
      value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .concat(category.trim() ? [category.trim()] : [])
    )
  );

const buildDefaultForm = (defaultFolderId = ""): ProjectFormValues => ({
  folderId: defaultFolderId,
  name: "",
  description: "",
  category: "General",
  dueDate: format(addDays(new Date(), 14), "yyyy-MM-dd"),
  status: "active",
  progress: 0,
  priority: "medium",
  budget: "",
  tags: "General",
  assigneeIds: [],
});

const projectToForm = (project: Project): ProjectFormValues => ({
  folderId: project.folderId,
  name: project.name,
  description: project.description,
  category: project.category || project.customFields.tags[0] || "General",
  dueDate: format(new Date(project.dueDate), "yyyy-MM-dd"),
  status: project.status === "planning" ? "active" : project.status,
  progress: project.progress ?? 0,
  priority: project.customFields.priority,
  budget:
    typeof project.customFields.budget === "number"
      ? String(project.customFields.budget)
      : "",
  tags: project.customFields.tags.join(", "),
  assigneeIds: project.assigneeIds,
});

function ProjectsPageContent() {
  const router = useRouter();
  const folders = useProjectStore((state) => state.folders);
  const members = useProjectStore((state) => state.members);
  const projects = useProjectStore((state) => state.projects);
  const tasks = useProjectStore((state) => state.tasks);
  const addProject = useProjectStore((state) => state.addProject);
  const updateProject = useProjectStore((state) => state.updateProject);
  const deleteProject = useProjectStore((state) => state.deleteProject);
  const { currentUser, isCheckingAuth } = useProtectedRoute();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectPendingDeletion, setProjectPendingDeletion] = useState<Project | null>(
    null
  );
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [shouldOpenCreateDialog, setShouldOpenCreateDialog] = useState(false);
  const [form, setForm] = useState<ProjectFormValues>(() =>
    buildDefaultForm(folders[0]?.id ?? "")
  );

  const projectSummaries = useMemo(
    () => getProjectSummaries(projects, tasks, folders),
    [folders, projects, tasks]
  );

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          projectSummaries
            .map((project) => project.category || project.customFields.tags[0] || "General")
            .filter(Boolean)
        )
      ).sort((left, right) => left.localeCompare(right)),
    [projectSummaries]
  );

  const filteredProjects = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return projectSummaries.filter((project) => {
      const category = project.category || project.customFields.tags[0] || "General";
      const matchesCategory =
        activeCategory === "all" ? true : category === activeCategory;
      const matchesSearch = normalizedSearch
        ? [project.name, project.description, category]
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch)
        : true;

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, projectSummaries, searchValue]);

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / PAGE_SIZE));
  const visibleProjects = filteredProjects.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  const editingProject = editingProjectId
    ? projects.find((project) => project.id === editingProjectId) ?? null
    : null;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchValue]);

  useEffect(() => {
    const syncCreateDialogState = () => {
      const params = new URLSearchParams(window.location.search);
      setShouldOpenCreateDialog(params.get("create") === "1");
    };

    syncCreateDialogState();
    window.addEventListener("popstate", syncCreateDialogState);

    return () => window.removeEventListener("popstate", syncCreateDialogState);
  }, []);

  useEffect(() => {
    if (shouldOpenCreateDialog) {
      setForm(buildDefaultForm(folders[0]?.id ?? ""));
      setIsCreateDialogOpen(true);
    }
  }, [folders, shouldOpenCreateDialog]);

  if (isCheckingAuth) {
    return <ProtectedPageSkeleton kind="grid" />;
  }

  const clearCreateQueryParam = () => {
    if (!shouldOpenCreateDialog) {
      return;
    }

    const nextParams = new URLSearchParams(window.location.search);
    nextParams.delete("create");
    const nextPath = nextParams.toString()
      ? `/projects?${nextParams.toString()}`
      : "/projects";

    setShouldOpenCreateDialog(false);
    router.replace(nextPath, { scroll: false });
  };

  const handleCreateDialogChange = (open: boolean) => {
    setIsCreateDialogOpen(open);

    if (!open) {
      setForm(buildDefaultForm(folders[0]?.id ?? ""));
      clearCreateQueryParam();
    }
  };

  const handleEditDialogChange = (open: boolean) => {
    if (!open) {
      setEditingProjectId(null);
      setForm(buildDefaultForm(folders[0]?.id ?? ""));
    }
  };

  const openCreateDialog = () => {
    setForm(buildDefaultForm(folders[0]?.id ?? ""));
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (project: Project) => {
    setEditingProjectId(project.id);
    setForm(projectToForm(project));
  };

  const activeProjectsCount = projectSummaries.filter(
    (project) => project.status === "active"
  ).length;
  const totalTrackedTime = projectSummaries.reduce(
    (total, project) => total + project.trackedTimeMs,
    0
  );

  const handleCreateProject = () => {
    if (!form.name.trim()) {
      toast.error("Project name is required.");
      return;
    }

    addProject(
      {
        folderId: form.folderId,
        name: form.name,
        description: form.description,
        category: form.category,
        progress: form.progress,
        dueDate: toIsoDate(form.dueDate),
        status: form.status,
        assigneeIds: form.assigneeIds,
        customFields: {
          priority: form.priority,
          tags: parseTags(form.tags, form.category),
          budget: parseBudget(form.budget),
        },
      },
      currentUser?.name
    );
    toast.success("Project created.");
    handleCreateDialogChange(false);
  };

  const handleUpdateProject = () => {
    if (!editingProject || !form.name.trim()) {
      toast.error("Project name is required.");
      return;
    }

    updateProject(
      editingProject.id,
      {
        folderId: form.folderId,
        name: form.name,
        description: form.description,
        category: form.category,
        progress: form.progress,
        dueDate: toIsoDate(form.dueDate),
        status: form.status,
        assigneeIds: form.assigneeIds,
        customFields: {
          priority: form.priority,
          tags: parseTags(form.tags, form.category),
          budget: parseBudget(form.budget),
        },
      },
      currentUser?.name
    );
    toast.success("Project updated.");
    handleEditDialogChange(false);
  };

  const handleDeleteProject = () => {
    if (!projectPendingDeletion) {
      return;
    }

    const projectToDelete = projectPendingDeletion;
    deleteProject(projectToDelete.id, currentUser?.name);
    setProjectPendingDeletion(null);
    toast.success("Project removed.");
  };

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 space-y-6"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Projects</h1>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/60 bg-card/80 px-4 py-3 shadow-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Active
              </p>
              <p className="mt-2 text-2xl font-semibold">{activeProjectsCount}</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/80 px-4 py-3 shadow-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Categories
              </p>
              <p className="mt-2 text-2xl font-semibold">{categories.length}</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/80 px-4 py-3 shadow-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Tracked
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {formatDurationCompact(totalTrackedTime)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search projects"
                className="h-12 rounded-2xl border-border/60 bg-card/80 pl-11"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeCategory === "all" ? "default" : "outline"}
                className="rounded-full"
                onClick={() => setActiveCategory("all")}
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "outline"}
                  className="rounded-full"
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <Button
            onClick={openCreateDialog}
            className="w-full rounded-2xl bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/25 sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      </motion.div>

      {visibleProjects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Empty className="rounded-3xl border border-dashed border-border/70 bg-card/60 p-10 shadow-sm">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FolderKanban className="h-6 w-6" />
                </EmptyMedia>
              <EmptyTitle>No projects</EmptyTitle>
              <EmptyDescription>Create a project or change the filter.</EmptyDescription>
              </EmptyHeader>
            <EmptyContent>
              <Button
                onClick={openCreateDialog}
                className="rounded-2xl bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/25"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create project
              </Button>
            </EmptyContent>
          </Empty>
        </motion.div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:gap-6 xl:grid-cols-3">
            {visibleProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
                whileHover={{ y: -4 }}
                className="group"
              >
                <div
                  onClick={() => router.push(`/projects/${project.id}`)}
                  className="cursor-pointer rounded-[1.75rem] border border-border/70 bg-card/90 p-6 shadow-sm transition-shadow hover:shadow-lg"
                >
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                        <Layers3 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {project.category || "General"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {project.totalTaskCount} tasks
                        </p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="rounded-xl opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                          onSelect={(event) => {
                            event.preventDefault();
                            openEditDialog(project);
                          }}
                        >
                          <PencilLine className="h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={(event) => {
                            event.preventDefault();
                            setProjectPendingDeletion(project);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <ProjectStatusBadge status={project.status} />
                    <Badge variant="outline" className="rounded-full">
                      {project.category || "General"}
                    </Badge>
                  </div>

                  <h3 className="mb-1 text-lg font-semibold transition-colors group-hover:text-primary">
                    {project.name}
                  </h3>
                  {project.description ? (
                    <p className="mb-5 line-clamp-2 text-sm text-muted-foreground">
                      {project.description}
                    </p>
                  ) : (
                    <div className="mb-5 h-[2.625rem]" />
                  )}

                  <ProgressBar value={project.progress} size="sm" className="mb-5" />

                  <div className="grid gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between gap-3">
                      <span>{project.progress}% complete</span>
                      <span>{formatDurationCompact(project.trackedTimeMs)} tracked</span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <span>Due {format(new Date(project.dueDate), "MMM d, yyyy")}</span>
                      </div>
                      <span>{project.openTaskCount} open</span>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-9 rounded-xl px-3 text-sm font-semibold text-muted-foreground hover:text-primary"
                      onClick={(event) => {
                        event.stopPropagation();
                        router.push(`/projects/${project.id}?panel=chat`);
                      }}
                    >
                      <MessageSquareMore className="mr-2 h-4 w-4" />
                      Chat
                    </Button>

                    <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                      <span>Open</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {totalPages > 1 ? (
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                className="rounded-2xl"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                className="rounded-2xl"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
              >
                Next
              </Button>
            </div>
          ) : null}
        </>
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={handleCreateDialogChange}>
        <DialogContent className="max-h-[calc(100vh-1rem)] overflow-hidden rounded-[2rem] border-border/60 bg-card/95 p-0 shadow-2xl backdrop-blur-2xl sm:max-h-[calc(100vh-2rem)] sm:max-w-2xl">
          <div className="flex max-h-[calc(100vh-1rem)] flex-col sm:max-h-[calc(100vh-2rem)]">
            <DialogHeader className="border-b border-border/60 px-6 py-5 text-left sm:px-8">
              <DialogTitle className="text-2xl">New Project</DialogTitle>
              <DialogDescription className="sr-only">Set project details.</DialogDescription>
            </DialogHeader>

            <ScrollArea className="min-h-0 flex-1 px-6 py-5 sm:px-8">
              <ProjectFormFields
                form={form}
                folders={folders}
                members={members}
                onChange={(updater) => setForm((current) => updater(current))}
              />
            </ScrollArea>

            <DialogFooter className="border-t border-border/60 px-6 py-5 sm:px-8">
              <Button
                variant="outline"
                className="rounded-2xl"
                onClick={() => handleCreateDialogChange(false)}
              >
                Cancel
              </Button>
              <Button
                className="rounded-2xl bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/25"
                onClick={handleCreateProject}
                disabled={!form.name.trim()}
              >
                Create
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingProject)} onOpenChange={handleEditDialogChange}>
        <DialogContent className="max-h-[calc(100vh-1rem)] overflow-hidden rounded-[2rem] border-border/60 bg-card/95 p-0 shadow-2xl backdrop-blur-2xl sm:max-h-[calc(100vh-2rem)] sm:max-w-2xl">
          <div className="flex max-h-[calc(100vh-1rem)] flex-col sm:max-h-[calc(100vh-2rem)]">
            <DialogHeader className="border-b border-border/60 px-6 py-5 text-left sm:px-8">
              <DialogTitle className="text-2xl">Edit Project</DialogTitle>
              <DialogDescription className="sr-only">Update project details.</DialogDescription>
            </DialogHeader>

            <ScrollArea className="min-h-0 flex-1 px-6 py-5 sm:px-8">
              <ProjectFormFields
                form={form}
                folders={folders}
                members={members}
                onChange={(updater) => setForm((current) => updater(current))}
              />
            </ScrollArea>

            <DialogFooter className="border-t border-border/60 px-6 py-5 sm:px-8">
              <Button
                variant="outline"
                className="rounded-2xl"
                onClick={() => handleEditDialogChange(false)}
              >
                Cancel
              </Button>
              <Button
                className="rounded-2xl bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/25"
                onClick={handleUpdateProject}
                disabled={!form.name.trim()}
              >
                Save
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(projectPendingDeletion)}
        onOpenChange={(open) => {
          if (!open) {
            setProjectPendingDeletion(null);
          }
        }}
      >
        <AlertDialogContent className="rounded-[2rem] border-border/60 bg-card/95 shadow-2xl backdrop-blur-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              {projectPendingDeletion?.name} will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-2xl">Cancel</AlertDialogCancel>
            <AlertDialogAction className="rounded-2xl" onClick={handleDeleteProject}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}

export default function ProjectsPage() {
  return <ProjectsPageContent />;
}
