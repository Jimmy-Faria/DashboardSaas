"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FolderKanban,
  Settings,
  Plus,
  LogOut,
  ChevronLeft,
  Layers,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { logoutMockUser } from "@/lib/mock-auth";
import { cn } from "@/lib/utils";
import { useProjectStore } from "@/store/useProjectStore";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Projects",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

interface SidebarProps {
  className?: string;
}

function SidebarUserPanel({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const hasMounted = useHasMounted();
  const currentUser = useProjectStore((state) => state.currentUser);
  const hasHydrated = useProjectStore((state) => state.hasHydrated);
  const setCurrentUser = useProjectStore((state) => state.setCurrentUser);

  const handleLogout = () => {
    logoutMockUser();
    setCurrentUser(null);
    router.push("/login");
  };

  if (!hasMounted || !hasHydrated) {
    return (
      <div className="rounded-2xl border border-sidebar-border/80 bg-sidebar-accent/40 p-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full bg-sidebar-accent" />
          {!compact && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-28 rounded-full bg-sidebar-accent" />
              <Skeleton className="h-3 w-36 rounded-full bg-sidebar-accent" />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Link href="/login">
        <Button
          variant="outline"
          className="w-full justify-center rounded-2xl border-sidebar-border bg-sidebar-accent/40 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          Sign in
        </Button>
      </Link>
    );
  }

  return (
    <div className="rounded-2xl border border-sidebar-border/80 bg-sidebar-accent/40 p-3">
      <div className={cn("flex items-center gap-3", compact && "justify-center")}>
        <Avatar className="h-10 w-10 ring-2 ring-sidebar-primary/40">
          <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
          <AvatarFallback className="bg-sidebar-primary font-semibold text-sidebar-primary-foreground">
            {currentUser.avatarFallback}
          </AvatarFallback>
        </Avatar>

        {!compact && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{currentUser.name}</p>
            <p className="truncate text-xs text-sidebar-foreground/70">
              {currentUser.email}
            </p>
          </div>
        )}

        {!compact && (
          <button
            onClick={handleLogout}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>

      {compact && (
        <button
          onClick={handleLogout}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-sidebar-accent px-3 py-2 text-xs font-medium text-sidebar-foreground/80 transition-colors hover:text-sidebar-foreground"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      )}
    </div>
  );
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col bg-sidebar/95 backdrop-blur-xl text-sidebar-foreground border-r border-sidebar-border/50 shadow-2xl",
        className
      )}
    >
      {/* Logo Section */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary"
          >
            <Layers className="h-5 w-5 text-sidebar-primary-foreground" />
          </motion.div>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="text-lg font-semibold tracking-tight"
              >
                ProjectFlow
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* New Project Button */}
      <div className="p-4">
        <Link href="/projects">
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30",
              isCollapsed && "px-0"
            )}
          >
            <Plus className="h-4 w-4" />
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  New Project
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-xl bg-sidebar-accent"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className="relative z-10 h-5 w-5" />
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="relative z-10"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-3">
        <SidebarUserPanel compact={isCollapsed} />
      </div>

      {/* Collapse Toggle */}
      <div className="border-t border-sidebar-border p-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-sidebar-accent/50 px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.div>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  );
}

// Mobile sidebar with drawer
export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar text-sidebar-foreground shadow-lg lg:hidden"
      >
        <Layers className="h-5 w-5" />
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 z-50 flex h-screen w-[280px] flex-col bg-sidebar text-sidebar-foreground shadow-2xl lg:hidden"
          >
            {/* Logo Section */}
            <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
              <Link href="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary">
                  <Layers className="h-5 w-5 text-sidebar-primary-foreground" />
                </div>
                <span className="text-lg font-semibold tracking-tight">ProjectFlow</span>
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-sidebar-accent"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>

            {/* New Project Button */}
            <div className="p-4">
              <Link
                href="/projects"
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-sidebar-primary px-4 py-3 text-sm font-medium text-sidebar-primary-foreground"
              >
                <Plus className="h-4 w-4" />
                <span>New Project</span>
              </Link>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 space-y-1 px-3 py-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;

                return (
                  <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                    <div
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-sidebar-border p-4">
              <SidebarUserPanel />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
