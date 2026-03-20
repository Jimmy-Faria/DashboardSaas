"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquareMore, SendHorizonal } from "lucide-react";
import { toast } from "sonner";
import {
  insertProjectChatMessage,
  loadProjectChatMessages,
  type ProjectChatMessage,
} from "@/lib/supabase/projectflow-state";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useProjectStore } from "@/store/useProjectStore";

interface ProjectChatPanelProps {
  projectId: string;
  className?: string;
  messagesClassName?: string;
  showHeader?: boolean;
}

const upsertMessage = (
  messages: ProjectChatMessage[],
  message: ProjectChatMessage
) =>
  [...messages.filter((current) => current.id !== message.id), message].sort(
    (left, right) =>
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
  );

export function ProjectChatPanel({
  projectId,
  className,
  messagesClassName,
  showHeader = true,
}: ProjectChatPanelProps) {
  const currentUser = useProjectStore((state) => state.currentUser);
  const [messages, setMessages] = useState<ProjectChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!currentUser?.id) {
      return;
    }

    let isActive = true;
    const client = getSupabaseBrowserClient();

    void loadProjectChatMessages({
      projectId,
    })
      .then((loadedMessages) => {
        if (isActive) {
          setMessages(loadedMessages);
        }
      })
      .catch((error) => {
        console.error("Unable to load project chat.", error);
      });

    if (!client) {
      return () => {
        isActive = false;
      };
    }

    const channel = client
      .channel("project_messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          void loadProjectChatMessages({ projectId })
            .then((loadedMessages) => {
              setMessages(loadedMessages);
            })
            .catch((error) => {
              console.error("Unable to refresh project chat.", error);
            });
        }
      )
      .subscribe();

    return () => {
      isActive = false;
      void client.removeChannel(channel);
    };
  }, [currentUser?.id, projectId]);

  useEffect(() => {
    const container = messagesContainerRef.current;

    if (!container) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [projectId, messages.length]);

  const handleSend = async () => {
    if (!currentUser?.id || !draft.trim()) {
      return;
    }

    const optimisticId = `message-optimistic-${Date.now()}`;
    const optimisticMessage: ProjectChatMessage = {
      id: optimisticId,
      projectId,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatarUrl: currentUser.avatarUrl,
      body: draft.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => upsertMessage(current, optimisticMessage));
    setDraft("");
    setIsSubmitting(true);

    try {
      const message = await insertProjectChatMessage({
        projectId,
        userId: currentUser.id,
        body: optimisticMessage.body,
      });

      setMessages((current) =>
        upsertMessage(
          current.filter((item) => item.id !== optimisticId),
          message
        )
      );
    } catch (error) {
      setMessages((current) => current.filter((message) => message.id !== optimisticId));
      setDraft(optimisticMessage.body);
      toast.error(
        error instanceof Error ? error.message : "Unable to send the message."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const orderedMessages = useMemo(
    () => messages.filter((message) => message.projectId === projectId),
    [messages, projectId]
  );

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col rounded-[2rem] border border-border/60 bg-card/90 p-6 shadow-sm",
        className
      )}
    >
      {showHeader ? (
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Project chat</h3>
          </div>
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <MessageSquareMore className="h-5 w-5" />
          </div>
        </div>
      ) : null}

      <div
        ref={messagesContainerRef}
        className={cn(
          "h-[320px] overflow-y-auto rounded-2xl border border-border/60 bg-background/40 p-4",
          messagesClassName
        )}
      >
        <div className="space-y-3">
          {orderedMessages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-background/50 p-5 text-sm text-muted-foreground">
              No messages.
            </div>
          ) : (
            orderedMessages.map((message) => {
              const isOwnMessage = message.userId === currentUser?.id;

              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    isOwnMessage ? "justify-end" : "justify-start"
                  )}
                >
                  {!isOwnMessage ? (
                    <Avatar className="mt-1 h-9 w-9">
                      <AvatarImage src={message.userAvatarUrl} alt={message.userName} />
                      <AvatarFallback>{message.userName.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  ) : null}

                  <div
                    className={cn(
                      "max-w-[82%] rounded-2xl px-4 py-3",
                      isOwnMessage
                        ? "bg-primary text-primary-foreground"
                        : "border border-border/60 bg-card"
                    )}
                  >
                    <div className="mb-1 flex items-center gap-2 text-xs">
                      <span className="font-semibold">{message.userName}</span>
                      <span className={cn(isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground")}>
                        {formatDistanceToNow(new Date(message.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-6">{message.body}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Message"
          className="min-h-24 rounded-2xl border-border/60 bg-background/50"
        />

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleSend}
            disabled={isSubmitting || !draft.trim() || !currentUser?.id}
            className="rounded-2xl bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/25"
          >
            <SendHorizonal className="h-4 w-4" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
