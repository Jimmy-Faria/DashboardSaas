"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Globe2,
  LogOut,
  UserRound,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { logoutUser } from "@/lib/supabase/auth";
import { useProjectStore } from "@/store/useProjectStore";

export function ProfileMenu() {
  const router = useRouter();
  const currentUser = useProjectStore((state) => state.currentUser);
  const updateProfile = useProjectStore((state) => state.updateProfile);
  const setCurrentUser = useProjectStore((state) => state.setCurrentUser);
  const [isOpen, setIsOpen] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);

  if (!currentUser) {
    return null;
  }

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);

        if (!open) {
          setShowLanguages(false);
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-11 w-11 rounded-2xl border-border/80 bg-card/95 shadow-[0_16px_30px_-18px_rgba(15,23,42,0.5)] backdrop-blur-sm transition hover:border-border hover:bg-card"
        >
          <Avatar className="h-8 w-8 ring-1 ring-border/60">
            <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
            <AvatarFallback className="bg-primary/15 text-sm font-semibold text-primary">
              {currentUser.avatarFallback}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2">
        <DropdownMenuLabel className="px-3 py-2">
          <p className="truncate text-sm font-semibold">{currentUser.name}</p>
          <p className="truncate text-xs text-muted-foreground">{currentUser.email}</p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild className="rounded-xl px-3 py-2">
          <Link href="/settings">
            <UserRound className="h-4 w-4" />
            Edit Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="rounded-xl px-3 py-2"
          onSelect={(event) => {
            event.preventDefault();
            setShowLanguages((current) => !current);
          }}
        >
          <Globe2 className="h-4 w-4" />
          Language
          <span className="ml-auto text-xs text-muted-foreground">
            {currentUser.language === "pt" ? "PT" : "EN"}
          </span>
          {showLanguages ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </DropdownMenuItem>

        {showLanguages ? (
          <div className="mt-1 space-y-1 px-2 pb-1">
            <DropdownMenuItem
              className="rounded-xl px-3 py-2"
              onSelect={() => {
                void updateProfile({ language: "en" });
                setShowLanguages(false);
                setIsOpen(false);
              }}
            >
              <span>English</span>
              {currentUser.language === "en" ? (
                <Check className="ml-auto h-4 w-4 text-primary" />
              ) : null}
            </DropdownMenuItem>

            <DropdownMenuItem
              className="rounded-xl px-3 py-2"
              onSelect={() => {
                void updateProfile({ language: "pt" });
                setShowLanguages(false);
                setIsOpen(false);
              }}
            >
              <span>Portuguese</span>
              {currentUser.language === "pt" ? (
                <Check className="ml-auto h-4 w-4 text-primary" />
              ) : null}
            </DropdownMenuItem>
          </div>
        ) : null}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="rounded-xl px-3 py-2"
          onSelect={async (event) => {
            event.preventDefault();
            setIsOpen(false);

            try {
              await logoutUser();
            } finally {
              setCurrentUser(null);
              router.replace("/login");
              router.refresh();
            }
          }}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
