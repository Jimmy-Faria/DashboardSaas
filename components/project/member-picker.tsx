"use client";

import { Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { WorkspaceMember } from "@/store/useProjectStore";

interface MemberPickerProps {
  members: WorkspaceMember[];
  selectedIds: string[];
  onToggle: (memberId: string) => void;
}

export function MemberPicker({
  members,
  selectedIds,
  onToggle,
}: MemberPickerProps) {
  return (
    <div className="max-h-56 overflow-y-auto pr-1">
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {members.map((member) => {
          const isSelected = selectedIds.includes(member.id);

          return (
            <button
              key={member.id}
              type="button"
              onClick={() => onToggle(member.id)}
              className={cn(
                "flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-colors",
                isSelected
                  ? "border-primary/30 bg-primary/10"
                  : "border-border/60 bg-background/50 hover:border-primary/20"
              )}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={member.avatarUrl} alt={member.name} />
                <AvatarFallback className="bg-muted font-semibold text-foreground">
                  {member.avatarFallback}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {member.name}
                </p>
                <p className="truncate text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {member.role}
                </p>
              </div>

              <div
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full border",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border/80 bg-background"
                )}
              >
                {isSelected ? <Check className="h-3 w-3" /> : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
   );
}
