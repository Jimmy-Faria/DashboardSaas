"use client";

import { useRouter } from "next/navigation";
import { Bell, BellDot, ChevronRight } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useProjectStore } from "@/store/useProjectStore";

const severityClasses = {
  info: "border-primary/20 bg-primary/10 text-primary",
  warning: "border-warning/20 bg-warning/10 text-warning",
  critical: "border-destructive/20 bg-destructive/10 text-destructive",
} as const;

export function InboxSheet() {
  const router = useRouter();
  const inbox = useProjectStore((state) => state.inbox);
  const markNotificationRead = useProjectStore((state) => state.markNotificationRead);
  const markAllNotificationsRead = useProjectStore(
    (state) => state.markAllNotificationsRead
  );
  const unreadCount = inbox.filter((notification) => !notification.read).length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative h-10 w-10 rounded-2xl border-border/60 bg-card/90 shadow-sm backdrop-blur-sm"
        >
          {unreadCount > 0 ? (
            <BellDot className="h-4 w-4" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[0.65rem] font-semibold text-primary-foreground">
              {unreadCount}
            </span>
          ) : null}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full gap-0 border-l border-border/70 bg-card/95 p-0 shadow-2xl backdrop-blur-2xl sm:max-w-md"
      >
        <SheetHeader className="border-b border-border/60 px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <SheetTitle>Inbox</SheetTitle>
              <SheetDescription>Updates and reminders.</SheetDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl"
              onClick={markAllNotificationsRead}
            >
              Mark all
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4 py-4">
          <div className="space-y-3">
            {inbox.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/70 bg-background/50 p-5 text-sm text-muted-foreground">
                No notifications.
              </div>
            ) : (
              inbox.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => {
                    markNotificationRead(notification.id);
                    router.push(notification.href || "/dashboard");
                  }}
                  className={cn(
                    "w-full rounded-2xl border border-border/60 bg-background/50 p-4 text-left transition-colors hover:border-primary/30 hover:bg-background",
                    !notification.read && "border-primary/20 bg-primary/5"
                  )}
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <Badge
                      variant="outline"
                      className={severityClasses[notification.severity]}
                    >
                      {notification.title}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <p className="text-sm font-medium text-foreground">
                    {notification.description}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    }).format(new Date(notification.createdAt))}
                  </p>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
