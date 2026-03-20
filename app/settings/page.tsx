"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Building2,
  Save,
  User,
  Users2,
} from "lucide-react";
import { toast } from "sonner";
import { listProfilesAction } from "@/app/settings/actions";
import {
  PASSWORD_HTML_PATTERN,
  getEmailValidationError,
  getNameValidationError,
  getOptionalBirthDateValidationError,
  getOptionalPasswordValidationError,
} from "@/lib/auth/validation";
import { AppLayout } from "@/components/layout/app-layout";
import { ProtectedPageSkeleton } from "@/components/layout/protected-page-skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import type { DatabaseProfileRow } from "@/lib/supabase/records";
import { useProjectStore } from "@/store/useProjectStore";

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

export default function SettingsPage() {
  const workspace = useProjectStore((state) => state.workspace);
  const members = useProjectStore((state) => state.members);
  const preferences = useProjectStore((state) => state.preferences);
  const updateProfile = useProjectStore((state) => state.updateProfile);
  const updateWorkspace = useProjectStore((state) => state.updateWorkspace);
  const setNotificationsEnabled = useProjectStore(
    (state) => state.setNotificationsEnabled
  );
  const { currentUser, isCheckingAuth } = useProtectedRoute();
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    birthDate: "",
    avatarUrl: "",
    password: "",
  });
  const [workspaceName, setWorkspaceName] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [directoryProfiles, setDirectoryProfiles] = useState<DatabaseProfileRow[]>([]);
  const profileNameError = profileForm.name
    ? getNameValidationError(profileForm.name)
    : null;
  const profileEmailError = profileForm.email
    ? getEmailValidationError(profileForm.email)
    : null;
  const profileBirthDateError = getOptionalBirthDateValidationError(
    profileForm.birthDate
  );
  const profilePasswordError = getOptionalPasswordValidationError(
    profileForm.password
  );

  useEffect(() => {
    setProfileForm({
      name: currentUser?.name ?? "",
      email: currentUser?.email ?? "",
      birthDate: currentUser?.birthDate ?? "",
      avatarUrl: currentUser?.avatarUrl ?? "",
      password: "",
    });
  }, [currentUser]);

  useEffect(() => {
    setWorkspaceName(workspace.name);
  }, [workspace.name]);

  useEffect(() => {
    let isActive = true;

    void listProfilesAction()
      .then((profiles) => {
        if (isActive) {
          setDirectoryProfiles(profiles);
        }
      })
      .catch((error) => {
        console.error("Unable to load profiles.", error);
      });

    return () => {
      isActive = false;
    };
  }, []);

  if (isCheckingAuth) {
    return <ProtectedPageSkeleton kind="grid" />;
  }

  const currentMember = members.find(
    (member) =>
      member.userId === currentUser?.id ||
      member.email.toLowerCase() === currentUser?.email?.toLowerCase()
  );

  const isProfileDirty =
    profileForm.name !== (currentUser?.name ?? "") ||
    profileForm.email !== (currentUser?.email ?? "") ||
    profileForm.birthDate !== (currentUser?.birthDate ?? "") ||
    profileForm.avatarUrl !== (currentUser?.avatarUrl ?? "") ||
    Boolean(profileForm.password.trim());

  const isWorkspaceDirty = workspaceName.trim() !== workspace.name;

  const handleSaveProfile = async () => {
    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      toast.error("Name and email are required.");
      return;
    }

    if (
      profileNameError ||
      profileEmailError ||
      profileBirthDateError ||
      profilePasswordError
    ) {
      toast.error(
        profileNameError ||
          profileEmailError ||
          profileBirthDateError ||
          profilePasswordError
      );
      return;
    }

    try {
      await updateProfile({
        name: profileForm.name,
        email: profileForm.email,
        birthDate: profileForm.birthDate,
        avatarUrl: profileForm.avatarUrl,
        password: profileForm.password || undefined,
      });

      setProfileForm((current) => ({ ...current, password: "" }));
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update profile."
      );
    }
  };

  const handleSaveWorkspace = () => {
    if (!workspaceName.trim()) {
      toast.error("Workspace name is required.");
      return;
    }

    updateWorkspace({ name: workspaceName }, currentUser?.name);
    toast.success("Workspace updated.");
  };
  const visibleMembers =
    directoryProfiles.length > 0
      ? directoryProfiles.map((profile) => ({
          id: profile.id,
          name: profile.full_name?.trim() || profile.email?.split("@")[0] || "ProjectFlow",
          email: profile.email?.trim().toLowerCase() || "",
          avatarUrl: profile.avatar_url?.trim() || undefined,
          avatarFallback: getInitials(
            profile.full_name?.trim() || profile.email?.split("@")[0] || "PF"
          ),
          role:
            profile.id === currentUser?.id
              ? "owner"
              : members.find((member) => member.id === profile.id)?.role ?? "member",
        }))
      : members;
  const filteredMembers = visibleMembers.filter((member) =>
    [member.name, member.email, member.role]
      .join(" ")
      .toLowerCase()
      .includes(memberSearch.trim().toLowerCase())
  );

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-[1180px]">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Settings</h1>
        </motion.div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr),380px] xl:items-start">
          <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-sm"
          >
            <div className="mb-6 flex items-start gap-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Workspace</h3>
              </div>
            </div>

            <div className="max-w-3xl space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Workspace name</label>
                <Input
                  value={workspaceName}
                  onChange={(event) => setWorkspaceName(event.target.value)}
                  className="h-12 rounded-2xl border-border/60 bg-background/50"
                />
              </div>
              <div className="flex justify-start">
                <Button
                  onClick={handleSaveWorkspace}
                  disabled={!isWorkspaceDirty || !workspaceName.trim()}
                  className="min-w-28 rounded-2xl bg-gradient-to-r from-primary to-accent px-5 shadow-lg shadow-primary/25"
                >
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-sm"
          >
            <div className="mb-6 flex items-start gap-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                <Users2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Members</h3>
              </div>
            </div>

            <div className="max-w-2xl space-y-4 border-b border-border/60 pb-6">
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr),auto] md:items-center">
                <Input
                  value={memberSearch}
                  onChange={(event) => setMemberSearch(event.target.value)}
                  className="h-12 rounded-2xl border-border/60 bg-background/50"
                  placeholder="Search people"
                />
                <div className="rounded-2xl border border-border/60 bg-background/50 px-4 py-3 text-sm text-muted-foreground">
                  {filteredMembers.length} profiles
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-3 lg:grid-cols-2">
              {filteredMembers.map((member) => {
                const isCurrentUser =
                  ("userId" in member ? member.userId : member.id) === currentUser?.id ||
                  member.email.toLowerCase() === currentUser?.email?.toLowerCase();

                return (
                  <div
                    key={member.id}
                    className="rounded-2xl border border-border/60 bg-background/40 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-11 w-11">
                        <AvatarImage src={member.avatarUrl} alt={member.name} />
                        <AvatarFallback className="bg-muted font-semibold text-foreground">
                          {member.avatarFallback}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-foreground">{member.name}</p>
                          <Badge variant="outline" className="rounded-full">
                            {member.role}
                          </Badge>
                          {isCurrentUser ? (
                            <Badge
                              variant="outline"
                              className="rounded-full border-primary/20 bg-primary/10 text-primary"
                            >
                              You
                            </Badge>
                          ) : null}
                        </div>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredMembers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/60 bg-background/40 p-5 text-sm text-muted-foreground">
                  No profiles found.
                </div>
              ) : null}
            </div>
          </motion.div>
        </div>

        <div className="space-y-6 xl:sticky xl:top-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-sm"
          >
            <div className="mb-6 flex items-start gap-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Profile</h3>
              </div>
            </div>

            <div className="mb-5 flex flex-col items-center gap-4 rounded-2xl border border-border/60 bg-background/50 p-5">
              <Avatar className="h-20 w-20 ring-2 ring-primary/20">
                <AvatarImage
                  src={profileForm.avatarUrl || currentUser?.avatarUrl}
                  alt={profileForm.name || currentUser?.name || "User avatar"}
                />
                <AvatarFallback className="bg-primary font-semibold text-primary-foreground">
                  {getInitials(profileForm.name || currentUser?.name || "PF")}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <p className="font-semibold">
                  {profileForm.name || currentUser?.name || "User"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentMember?.role ?? "member"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Full name</label>
                <Input
                  value={profileForm.name}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  aria-invalid={Boolean(profileNameError)}
                  className="h-12 rounded-2xl border-border/60 bg-background/50"
                />
                {profileNameError ? (
                  <p className="text-xs font-medium text-red-600 dark:text-red-400">
                    {profileNameError}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Email</label>
                <Input
                  type="email"
                  value={profileForm.email}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  inputMode="email"
                  spellCheck={false}
                  autoCapitalize="none"
                  aria-invalid={Boolean(profileEmailError)}
                  className="h-12 rounded-2xl border-border/60 bg-background/50"
                />
                {profileEmailError ? (
                  <p className="text-xs font-medium text-red-600 dark:text-red-400">
                    {profileEmailError}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Birth date</label>
                <Input
                  type="date"
                  value={profileForm.birthDate}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      birthDate: event.target.value,
                    }))
                  }
                  aria-invalid={Boolean(profileBirthDateError)}
                  className="h-12 rounded-2xl border-border/60 bg-background/50"
                />
                {profileBirthDateError ? (
                  <p className="text-xs font-medium text-red-600 dark:text-red-400">
                    {profileBirthDateError}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Avatar URL</label>
                <Input
                  value={profileForm.avatarUrl}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      avatarUrl: event.target.value,
                    }))
                  }
                  className="h-12 rounded-2xl border-border/60 bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">New password</label>
                <Input
                  type="password"
                  value={profileForm.password}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  minLength={8}
                  pattern={PASSWORD_HTML_PATTERN}
                  title="Use at least 8 characters with letters and numbers."
                  aria-invalid={Boolean(profilePasswordError)}
                  className="h-12 rounded-2xl border-border/60 bg-background/50"
                  placeholder="New password"
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to keep the current password.
                </p>
                {profilePasswordError ? (
                  <p className="text-xs font-medium text-red-600 dark:text-red-400">
                    {profilePasswordError}
                  </p>
                ) : null}
              </div>

              <div className="flex justify-start">
                <Button
                  onClick={() => void handleSaveProfile()}
                  disabled={
                    !isProfileDirty ||
                    !profileForm.name.trim() ||
                    !profileForm.email.trim() ||
                    Boolean(
                      profileNameError ||
                        profileEmailError ||
                        profileBirthDateError ||
                        profilePasswordError
                    )
                  }
                  className="min-w-36 rounded-2xl bg-gradient-to-r from-primary to-accent px-5 shadow-lg shadow-primary/25"
                >
                  <Save className="h-4 w-4" />
                  Save profile
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-sm"
          >
            <div className="mb-5 flex items-start gap-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Notifications</h3>
              </div>
            </div>

            <div className="flex items-start justify-between gap-4 rounded-2xl border border-border/60 bg-background/50 p-4">
              <div>
                <p className="font-semibold">Inbox alerts</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Due dates, assignments, and timers.
                </p>
              </div>
              <Switch
                checked={preferences.notificationsEnabled}
                onCheckedChange={(enabled) => {
                  setNotificationsEnabled(enabled);
                  toast.success(enabled ? "Notifications enabled." : "Notifications muted.");
                }}
              />
            </div>
          </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
