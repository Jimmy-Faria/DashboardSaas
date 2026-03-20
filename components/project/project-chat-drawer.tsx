"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageSquareMore, Plus, Search, Users2 } from "lucide-react";
import { listProfilesAction } from "@/app/settings/actions";
import { ProjectChatPanel } from "./project-chat-panel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { DatabaseProfileRow } from "@/lib/supabase/records";
import { useProjectStore } from "@/store/useProjectStore";

interface ProjectChatDrawerProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getProfileName = (profile: DatabaseProfileRow) =>
  profile.full_name?.trim() || profile.email?.split("@")[0] || "ProjectFlow";

const getInitials = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

export function ProjectChatDrawer({
  projectId,
  open,
  onOpenChange,
}: ProjectChatDrawerProps) {
  const currentUser = useProjectStore((state) => state.currentUser);
  const members = useProjectStore((state) => state.members);
  const projects = useProjectStore((state) => state.projects);
  const addWorkspaceMember = useProjectStore((state) => state.addWorkspaceMember);
  const updateProject = useProjectStore((state) => state.updateProject);
  const project = projects.find((item) => item.id === projectId) ?? null;
  const [directoryProfiles, setDirectoryProfiles] = useState<DatabaseProfileRow[]>([]);
  const [emailQuery, setEmailQuery] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    let isActive = true;

    void listProfilesAction()
      .then((profiles) => {
        if (isActive) {
          setDirectoryProfiles(profiles);
        }
      })
      .catch((error) => {
        console.error("Unable to load profile directory.", error);
      });

    return () => {
      isActive = false;
    };
  }, [open]);

  const participantMembers = useMemo(
    () =>
      project
        ? members.filter((member) => project.assigneeIds.includes(member.id))
        : [],
    [members, project]
  );

  const visibleProfiles = useMemo(() => {
    const normalizedQuery = emailQuery.trim().toLowerCase();

    return directoryProfiles
      .filter((profile) => profile.id !== currentUser?.id)
      .filter((profile) => {
        if (!normalizedQuery) {
          return true;
        }

        return [profile.email, profile.full_name]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .slice(0, 6);
  }, [currentUser?.id, directoryProfiles, emailQuery]);

  const handleAddProfile = (profile: DatabaseProfileRow) => {
    if (!project) {
      return;
    }

    const normalizedEmail = profile.email?.trim().toLowerCase();
    const nextName = getProfileName(profile);

    if (!normalizedEmail) {
      return;
    }

    let member =
      members.find((item) => item.userId === profile.id) ??
      members.find((item) => item.email.toLowerCase() === normalizedEmail) ??
      null;

    if (!member) {
      addWorkspaceMember(
        {
          name: nextName,
          email: normalizedEmail,
          avatarUrl: profile.avatar_url?.trim() || undefined,
          role: "member",
        },
        currentUser?.name
      );

      member =
        useProjectStore
          .getState()
          .members.find((item) => item.userId === profile.id) ??
        useProjectStore
          .getState()
          .members.find((item) => item.email.toLowerCase() === normalizedEmail) ??
        null;
    }

    if (!member || project.assigneeIds.includes(member.id)) {
      setEmailQuery("");
      return;
    }

    updateProject(
      project.id,
      {
        assigneeIds: [...project.assigneeIds, member.id],
      },
      currentUser?.name
    );
    setEmailQuery("");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" className="rounded-2xl">
          <MessageSquareMore className="h-4 w-4" />
          Chat
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full gap-0 border-l border-border/70 bg-card/95 p-0 shadow-2xl backdrop-blur-2xl sm:max-w-[34rem]"
      >
        <SheetHeader className="border-b border-border/60 px-6 py-5">
          <SheetTitle>Project Chat</SheetTitle>
          <SheetDescription>Messages and people for this project.</SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="border-b border-border/60 px-6 py-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Users2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">People</p>
                <p className="text-xs text-muted-foreground">
                  Add existing platform users by email.
                </p>
              </div>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={emailQuery}
                onChange={(event) => setEmailQuery(event.target.value)}
                placeholder="Search by email"
                className="h-11 rounded-2xl border-border/60 bg-background/50 pl-10"
              />
            </div>

            {participantMembers.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {participantMembers.map((member) => (
                  <Badge
                    key={member.id}
                    variant="outline"
                    className="flex items-center gap-2 rounded-full px-2.5 py-1.5"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={member.avatarUrl} alt={member.name} />
                      <AvatarFallback className="text-[10px]">
                        {member.avatarFallback}
                      </AvatarFallback>
                    </Avatar>
                    <span>{member.name}</span>
                  </Badge>
                ))}
              </div>
            ) : null}

            <div className="mt-4 space-y-2">
              {visibleProfiles.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/60 bg-background/40 px-4 py-3 text-sm text-muted-foreground">
                  No users found.
                </div>
              ) : (
                visibleProfiles.map((profile) => {
                  const normalizedEmail = profile.email?.trim().toLowerCase() || "";
                  const alreadyAdded = participantMembers.some(
                    (member) =>
                      member.userId === profile.id ||
                      member.email.toLowerCase() === normalizedEmail
                  );

                  return (
                    <div
                      key={profile.id}
                      className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/40 px-3 py-3"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={profile.avatar_url?.trim() || undefined}
                          alt={getProfileName(profile)}
                        />
                        <AvatarFallback>
                          {getInitials(getProfileName(profile))}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {getProfileName(profile)}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {normalizedEmail}
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant={alreadyAdded ? "outline" : "default"}
                        className="rounded-xl"
                        disabled={alreadyAdded}
                        onClick={() => handleAddProfile(profile)}
                      >
                        <Plus className="h-4 w-4" />
                        {alreadyAdded ? "Added" : "Add"}
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="p-4">
            <ProjectChatPanel
              projectId={projectId}
              showHeader={false}
              className="border-none bg-transparent p-0 shadow-none"
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
