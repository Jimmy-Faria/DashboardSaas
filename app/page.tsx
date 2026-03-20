"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  FolderTree,
  Layers,
  Timer,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: FolderTree,
    title: "Projects",
    description: "Folders, projects, and status.",
  },
  {
    icon: Workflow,
    title: "Tasks",
    description: "Board, subtasks, assignees, and edits.",
  },
  {
    icon: Timer,
    title: "Tracking",
    description: "Time, alerts, and progress.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed left-0 right-0 top-0 z-50 border-b border-border/40 bg-background/75 backdrop-blur-xl"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-[4.5rem] sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/25">
              <Layers className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">ProjectFlow</span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-6">
            <Link
              href="/login"
              className="hidden text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              Sign in
            </Link>
            <Link href="/register">
              <Button className="h-10 rounded-2xl bg-gradient-to-r from-primary to-accent px-4 font-semibold shadow-lg shadow-primary/25 sm:h-11 sm:px-5">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      <section className="relative overflow-hidden pb-20 pt-28 sm:pb-28 sm:pt-40 lg:pb-32 lg:pt-44">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/4 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-[320px] w-[320px] rounded-full bg-accent/6 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-7xl"
            >
              Projects, tasks, and progress{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                in one workspace
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl"
            >
              Plan work, move tasks, track time, and keep delivery clear.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center"
            >
              <Link href="/register">
                <Button
                  size="lg"
                  className="min-w-[200px] rounded-2xl bg-gradient-to-r from-primary to-accent py-6 text-base font-semibold shadow-xl shadow-primary/30 sm:py-7"
                >
                  Create account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="min-w-[200px] rounded-2xl border-2 py-6 text-base font-semibold sm:py-7"
                >
                  Sign in
                </Button>
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative mx-auto mt-14 max-w-5xl sm:mt-20"
          >
            <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/90 shadow-2xl backdrop-blur-sm">
              <div className="flex items-center gap-2 border-b border-border/50 bg-muted/30 px-4 py-4 sm:px-5">
                <div className="h-3.5 w-3.5 rounded-full bg-destructive/70" />
                <div className="h-3.5 w-3.5 rounded-full bg-warning/70" />
                <div className="h-3.5 w-3.5 rounded-full bg-success/70" />
                <span className="ml-2 text-xs font-medium text-muted-foreground sm:ml-4 sm:text-sm">
                  ProjectFlow
                </span>
              </div>

              <div className="grid gap-4 p-4 sm:grid-cols-3 sm:gap-5 sm:p-8">
                {["To Do", "In Progress", "Done"].map((column, colIndex) => (
                  <div key={column} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-muted-foreground">{column}</h3>
                      <span className="rounded-full bg-muted/50 px-2 py-1 text-xs font-bold text-muted-foreground">
                        {3 - colIndex}
                      </span>
                    </div>
                    {Array.from({ length: 3 - colIndex }).map((_, index) => (
                      <div
                        key={index}
                        className="rounded-2xl border border-border/50 bg-background/80 p-4 shadow-sm"
                      >
                        <div className="h-2.5 w-2/3 rounded-full bg-muted/80" />
                        <div className="mt-3 h-2 w-full rounded-full bg-muted/50" />
                        <div className="mt-2 h-2 w-4/5 rounded-full bg-muted/50" />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-border/50 py-18 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Workspace
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-3xl border border-border/60 bg-card/80 p-8 shadow-sm backdrop-blur-sm"
                >
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 shadow-lg shadow-primary/10">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
                <Layers className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">ProjectFlow</span>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Project workspace.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
