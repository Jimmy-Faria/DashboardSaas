"use client";

import { Pause, Play, TimerReset } from "lucide-react";
import { formatDurationCompact } from "@/lib/projectflow";
import { cn } from "@/lib/utils";

interface TimeTrackerChipProps {
  trackedTimeMs: number;
  isRunning?: boolean;
  onToggle?: () => void;
  className?: string;
}

export function TimeTrackerChip({
  trackedTimeMs,
  isRunning = false,
  onToggle,
  className,
}: TimeTrackerChipProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground",
        className
      )}
    >
      {isRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
      <span>{formatDurationCompact(trackedTimeMs)}</span>
      {trackedTimeMs === 0 ? <TimerReset className="h-3.5 w-3.5" /> : null}
    </button>
  );
}
