"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  FolderKanban,
  Layers,
  LayoutDashboard,
  Plus,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

function SidebarNav({
  isCollapsed,
  pathname,
  onNavigate,
}: {
  isCollapsed?: boolean;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="mt-6 px-1">
      <AnimatePresence mode="wait">
        {!isCollapsed ? (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="mb-3 px-3 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-sidebar-foreground/35"
          >
            Navigation
          </motion.p>
        ) : null}
      </AnimatePresence>

      <nav className="space-y-1.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} onClick={onNavigate}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.985 }}
                className={cn(
                  "relative flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/72 hover:bg-sidebar-accent/45 hover:text-sidebar-foreground"
                )}
              >
                {isActive ? (
                  <motion.div
                    layoutId={onNavigate ? "mobileActiveNav" : "desktopActiveNav"}
                    className="absolute inset-0 rounded-2xl border border-white/5 bg-sidebar-accent shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                ) : null}

                <Icon className="relative z-10 h-[1.1rem] w-[1.1rem]" />

                <AnimatePresence mode="wait">
                  {!isCollapsed ? (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="relative z-10"
                    >
                      {item.label}
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 84 : 280 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border/60 bg-sidebar/96 text-sidebar-foreground shadow-[0_28px_80px_-40px_rgba(15,23,42,0.85)] backdrop-blur-xl",
        className
      )}
    >
      <div className="flex h-[78px] items-center px-5">
        <Link href="/" className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sidebar-primary shadow-[0_18px_34px_-20px_rgba(96,87,255,0.8)]"
          >
            <Layers className="h-5 w-5 text-sidebar-primary-foreground" />
          </motion.div>

          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="text-[1.35rem] font-semibold tracking-tight"
              >
                ProjectFlow
              </motion.span>
            ) : null}
          </AnimatePresence>
        </Link>
      </div>

      <div className="flex-1 px-4 pb-4">
        <div className="h-full rounded-[1.75rem] border border-sidebar-border/55 bg-sidebar-accent/18 px-3 py-4">
          <Link href="/projects?create=1">
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-4 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_20px_38px_-22px_rgba(96,87,255,0.95)] transition-all hover:shadow-[0_24px_44px_-20px_rgba(96,87,255,1)]",
                isCollapsed && "px-0"
              )}
            >
              <Plus className="h-4 w-4" />

              <AnimatePresence mode="wait">
                {!isCollapsed ? (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    New Project
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </motion.div>
          </Link>

          <SidebarNav isCollapsed={isCollapsed} pathname={pathname} />
        </div>
      </div>

      <div className="border-t border-sidebar-border/60 px-4 py-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-sidebar-border/50 bg-sidebar-accent/32 px-3 py-3 text-sm font-medium text-sidebar-foreground/72 transition-colors hover:bg-sidebar-accent/58 hover:text-sidebar-foreground"
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.div>

          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                Collapse
              </motion.span>
            ) : null}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  );
}

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-sidebar-border/70 bg-sidebar/95 text-sidebar-foreground shadow-lg backdrop-blur-xl lg:hidden"
      >
        <Layers className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen ? (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 z-50 flex h-screen w-[min(86vw,320px)] flex-col border-r border-sidebar-border/60 bg-sidebar text-sidebar-foreground shadow-2xl lg:hidden"
          >
            <div className="flex h-[78px] items-center justify-between px-5">
              <Link
                href="/"
                className="flex items-center gap-3"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sidebar-primary shadow-[0_18px_34px_-20px_rgba(96,87,255,0.8)]">
                  <Layers className="h-5 w-5 text-sidebar-primary-foreground" />
                </div>
                <span className="text-[1.35rem] font-semibold tracking-tight">
                  ProjectFlow
                </span>
              </Link>

              <button
                onClick={() => setIsOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-sidebar-accent/60"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 px-4 pb-4">
              <div className="h-full rounded-[1.75rem] border border-sidebar-border/55 bg-sidebar-accent/18 px-3 py-4">
                <Link
                  href="/projects?create=1"
                  onClick={() => setIsOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-4 py-3.5 text-sm font-semibold text-sidebar-primary-foreground shadow-[0_20px_38px_-22px_rgba(96,87,255,0.95)]"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Project</span>
                </Link>

                <SidebarNav pathname={pathname} onNavigate={() => setIsOpen(false)} />
              </div>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
  );
}
