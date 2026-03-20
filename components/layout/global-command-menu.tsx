"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bolt,
  BellRing,
  FolderKanban,
  PlusSquare,
  Search,
  Settings2,
  UserRound,
  Workflow,
} from "lucide-react";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { getProjectSummaries } from "@/lib/projectflow";
import { useProjectStore } from "@/store/useProjectStore";

export function GlobalCommandMenu() {
  const router = useRouter();
  const workspace = useProjectStore((state) => state.workspace);
  const projects = useProjectStore((state) => state.projects);
  const tasks = useProjectStore((state) => state.tasks);
  const folders = useProjectStore((state) => state.folders);
  const members = useProjectStore((state) => state.members);
  const inbox = useProjectStore((state) => state.inbox);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const projectSummaries = useMemo(
    () => getProjectSummaries(projects, tasks, folders).slice(0, 8),
    [folders, projects, tasks]
  );

  const rootTasks = useMemo(
    () => tasks.filter((task) => !task.parentTaskId).slice(0, 8),
    [tasks]
  );

  const unreadInbox = useMemo(
    () => inbox.filter((notification) => !notification.read).slice(0, 6),
    [inbox]
  );

  const openRoute = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 w-full items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/90 px-4 text-sm text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:border-primary/30 hover:text-foreground sm:min-w-[18rem]"
      >
        <span className="inline-flex items-center gap-2">
          <Search className="h-4 w-4" />
          Search {workspace.name}
        </span>
        <KbdGroup className="hidden sm:inline-flex">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        className="max-w-2xl overflow-hidden rounded-[2rem] border-border/70 bg-card/95 shadow-2xl backdrop-blur-2xl"
      >
        <CommandInput placeholder="Search projects, tasks, or settings" />
        <CommandList className="max-h-[70vh]">
          <CommandEmpty>No results.</CommandEmpty>

          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => openRoute("/projects?create=1")}>
              <PlusSquare className="h-4 w-4" />
              <span>New project</span>
              <CommandShortcut>Enter</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => openRoute("/settings")}>
              <Settings2 className="h-4 w-4" />
              <span>Settings</span>
              <CommandShortcut>⌘,</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Projects">
            {projectSummaries.map((project) => (
              <CommandItem
                key={project.id}
                onSelect={() => openRoute(`/projects/${project.id}`)}
              >
                <FolderKanban className="h-4 w-4" />
                <span>{project.name}</span>
                <CommandShortcut>{project.folder?.name ?? "Folder"}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Tasks">
            {rootTasks.map((task) => (
              <CommandItem
                key={task.id}
                onSelect={() => openRoute(`/projects/${task.projectId}`)}
              >
                <Workflow className="h-4 w-4" />
                <span>{task.title}</span>
                <CommandShortcut>{task.status}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Members">
            {members.slice(0, 6).map((member) => (
              <CommandItem
                key={member.id}
                onSelect={() => openRoute("/settings")}
              >
                <UserRound className="h-4 w-4" />
                <span>{member.name}</span>
                <CommandShortcut>{member.role}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Inbox">
            {unreadInbox.map((notification) => (
              <CommandItem
                key={notification.id}
                onSelect={() => openRoute(notification.href || "/dashboard")}
              >
                <BellRing className="h-4 w-4" />
                <span>{notification.title}</span>
                <CommandShortcut>{notification.description}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>

          {unreadInbox.length === 0 ? (
            <>
              <CommandSeparator />
              <CommandGroup heading="Quick Jump">
              <CommandItem onSelect={() => openRoute("/dashboard")}>
                <Bolt className="h-4 w-4" />
                <span>Dashboard</span>
              </CommandItem>
              </CommandGroup>
            </>
          ) : null}
        </CommandList>
      </CommandDialog>
    </>
  );
}
