"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { WorkspaceMember } from "@/store/useProjectStore";

interface AssigneeStackProps {
  members: WorkspaceMember[];
  max?: number;
  size?: "sm" | "md";
  className?: string;
}

const sizeClasses = {
  sm: "h-7 w-7 text-[0.65rem]",
  md: "h-8 w-8 text-[0.7rem]",
};

export function AssigneeStack({
  members,
  max = 3,
  size = "md",
  className,
}: AssigneeStackProps) {
  if (members.length === 0) {
    return (
      <div
        className={cn(
          "inline-flex items-center rounded-full border border-dashed border-border/70 px-2.5 py-1 text-xs text-muted-foreground",
          className
        )}
      >
        Unassigned
      </div>
    );
  }

  const visibleMembers = members.slice(0, max);
  const overflowCount = members.length - visibleMembers.length;

  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex items-center">
        {visibleMembers.map((member, index) => (
          <Avatar
            key={member.id}
            className={cn(
              "border-2 border-background shadow-sm",
              sizeClasses[size],
              index > 0 && "-ml-2.5"
            )}
          >
            <AvatarImage src={member.avatarUrl} alt={member.name} />
            <AvatarFallback className="bg-muted font-semibold text-foreground">
              {member.avatarFallback}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>

      {overflowCount > 0 ? (
        <div className="-ml-2.5 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-card text-[0.68rem] font-semibold text-muted-foreground shadow-sm">
          +{overflowCount}
        </div>
      ) : null}
    </div>
  );
}
