"use client";

import { Badge } from "@/components/ui/badge";
import { getProjectStatusLabel, projectStatusClasses } from "@/lib/projectflow";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/store/useProjectStore";

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

export function ProjectStatusBadge({
  status,
  className,
}: ProjectStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(projectStatusClasses[status], className)}
    >
      {getProjectStatusLabel(status)}
    </Badge>
  );
}
