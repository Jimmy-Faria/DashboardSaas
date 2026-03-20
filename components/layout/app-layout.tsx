"use client";

import { motion } from "framer-motion";
import { InboxSheet } from "./inbox-sheet";
import { GlobalCommandMenu } from "./global-command-menu";
import { ProfileMenu } from "./profile-menu";
import { Sidebar, MobileSidebar } from "./sidebar";
import { ThemeToggle } from "./theme-toggle";
import { useProjectStore } from "@/store/useProjectStore";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const workspace = useProjectStore((state) => state.workspace);
  const folders = useProjectStore((state) => state.folders);

  return (
    <div className="min-h-screen bg-background">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <MobileSidebar />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen lg:pl-[280px]"
      >
        <div className="mx-auto w-full max-w-[1440px] px-4 pb-8 pt-20 sm:px-6 sm:pb-10 sm:pt-24 lg:px-8 lg:pb-12 lg:pt-8">
          <div className="mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                {workspace.name}
              </h2>
              <span className="rounded-full border border-border/70 bg-card/70 px-2.5 py-1 text-xs text-muted-foreground">
                {folders.length} folders
              </span>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <GlobalCommandMenu />
              <div className="flex items-center gap-3">
                <InboxSheet />
                <ThemeToggle />
                <ProfileMenu />
              </div>
            </div>
          </div>

          {children}
        </div>
      </motion.main>
    </div>
  );
}
