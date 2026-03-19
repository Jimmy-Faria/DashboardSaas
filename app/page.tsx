"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Layers,
  ArrowRight,
  CheckCircle2,
  Zap,
  Users,
  BarChart3,
  Sparkles,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Organize tasks in seconds with our intuitive drag-and-drop interface powered by spring physics.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Work together seamlessly with real-time sync and shared workspaces across your organization.",
  },
  {
    icon: BarChart3,
    title: "Powerful Analytics",
    description: "Track velocity and gain actionable insights with comprehensive metrics dashboards.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "SOC 2 compliant with SSO, RBAC, and audit logs for complete peace of mind.",
  },
];

const benefits = [
  "Unlimited projects and tasks",
  "Kanban boards with spring physics",
  "Real-time collaboration",
  "Advanced analytics dashboard",
  "Custom automation workflows",
  "Priority support & SLA",
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl"
      >
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/25"
            >
              <Layers className="h-5 w-5 text-primary-foreground" />
            </motion.div>
            <span className="text-xl font-bold">ProjectFlow</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="hidden sm:block text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
            <Link href="/register">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button size="default" className="rounded-2xl font-semibold bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-36 pb-24 sm:pt-44 sm:pb-36">
        {/* Background Gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute top-1/3 right-1/4 h-[400px] w-[400px] rounded-full bg-accent/5 blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 h-[300px] w-[300px] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1, type: "spring" }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/80 backdrop-blur-sm px-5 py-2 text-sm shadow-sm"
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              >
                <Sparkles className="h-4 w-4 text-primary" />
              </motion.div>
              <span className="font-semibold text-muted-foreground">Now in public beta - Free for early adopters</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 80 }}
              className="text-balance text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
            >
              Manage projects with{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">clarity</span> and{" "}
              <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">precision</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, type: "spring", stiffness: 80 }}
              className="mt-8 text-pretty text-xl text-muted-foreground sm:text-2xl leading-relaxed"
            >
              ProjectFlow combines the simplicity of Trello with the power of
              Notion. Organize tasks, track velocity, and ship faster.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, type: "spring", stiffness: 80 }}
              className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row"
            >
              <Link href="/register">
                <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Button size="lg" className="group min-w-[200px] rounded-2xl py-7 text-base font-bold bg-gradient-to-r from-primary to-accent shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40">
                    Start for free
                    <motion.span
                      className="ml-2"
                      initial={{ x: 0 }}
                      whileHover={{ x: 4 }}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </motion.span>
                  </Button>
                </motion.div>
              </Link>
              <Link href="/projects/demo">
                <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" size="lg" className="min-w-[200px] rounded-2xl py-7 text-base font-bold border-2">
                    View live demo
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6, type: "spring", stiffness: 60 }}
            className="relative mx-auto mt-20 max-w-5xl"
          >
            <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-2xl">
              <div className="flex items-center gap-2 border-b border-border/50 bg-muted/30 backdrop-blur-sm px-5 py-4">
                <div className="h-3.5 w-3.5 rounded-full bg-destructive/70" />
                <div className="h-3.5 w-3.5 rounded-full bg-warning/70" />
                <div className="h-3.5 w-3.5 rounded-full bg-success/70" />
                <span className="ml-4 text-sm font-medium text-muted-foreground">ProjectFlow - Sprint Board</span>
              </div>
              <div className="grid grid-cols-3 gap-5 p-8">
                {["To Do", "In Progress", "Done"].map((column, colIndex) => (
                  <div key={column} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-muted-foreground">
                        {column}
                      </h3>
                      <span className="text-xs font-bold text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                        {3 - colIndex}
                      </span>
                    </div>
                    {Array.from({ length: 3 - colIndex }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 + colIndex * 0.15 + i * 0.08, type: "spring" }}
                        whileHover={{ y: -2, scale: 1.02 }}
                        className="rounded-2xl bg-background/80 backdrop-blur-sm p-4 shadow-sm border border-border/50 cursor-pointer"
                      >
                        <div className="h-2.5 w-2/3 rounded-full bg-muted/80" />
                        <div className="mt-3 h-2 w-full rounded-full bg-muted/50" />
                        <div className="mt-2 h-2 w-4/5 rounded-full bg-muted/50" />
                      </motion.div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -bottom-6 -left-6 -right-6 h-12 rounded-b-3xl bg-gradient-to-t from-background to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-36">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, type: "spring" }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              Everything you need to ship faster
            </h2>
            <p className="mt-6 text-pretty text-xl text-muted-foreground">
              Powerful features designed for teams who want to move fast and break nothing.
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card/80 backdrop-blur-sm p-8 transition-shadow hover:shadow-xl cursor-pointer"
                >
                  <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 8 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 shadow-lg shadow-primary/10"
                  >
                    <Icon className="h-7 w-7 text-primary" />
                  </motion.div>
                  <h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="border-y border-border/50 bg-muted/20 backdrop-blur-sm py-24 sm:py-36">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, type: "spring" }}
            >
              <h2 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
                Built for teams who want to move fast
              </h2>
              <p className="mt-6 text-pretty text-xl text-muted-foreground leading-relaxed">
                Stop juggling between tools. ProjectFlow brings everything
                together so you can focus on shipping great products.
              </p>

              <motion.ul 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="mt-10 space-y-5"
              >
                {benefits.map((benefit) => (
                  <motion.li
                    key={benefit}
                    variants={itemVariants}
                    className="flex items-center gap-4"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-success/15">
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-success" />
                    </div>
                    <span className="font-medium">{benefit}</span>
                  </motion.li>
                ))}
              </motion.ul>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-12"
              >
                <Link href="/register">
                  <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                    <Button size="lg" className="rounded-2xl py-7 text-base font-bold bg-gradient-to-r from-primary to-accent shadow-xl shadow-primary/25">
                      Get started today
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
              className="relative"
            >
              <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/90 backdrop-blur-sm p-8 shadow-2xl">
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="grid grid-cols-2 gap-5"
                >
                  {[
                    { label: "Active Projects", value: "12", trend: "+2" },
                    { label: "Tasks Shipped", value: "148", trend: "+23" },
                    { label: "Team Velocity", value: "94%", trend: "+8%" },
                    { label: "Sprint Success", value: "87%", trend: "+5%" },
                  ].map((stat) => (
                    <motion.div
                      key={stat.label}
                      variants={itemVariants}
                      whileHover={{ scale: 1.03, y: -2 }}
                      className="rounded-2xl bg-muted/40 backdrop-blur-sm p-5 border border-border/30 cursor-pointer"
                    >
                      <p className="text-sm font-semibold text-muted-foreground">
                        {stat.label}
                      </p>
                      <div className="mt-2 flex items-baseline gap-3">
                        <span className="text-3xl font-bold">{stat.value}</span>
                        <span className="text-sm font-bold text-success bg-success/15 px-2 py-0.5 rounded-full">
                          {stat.trend}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Decorative blur */}
              <div className="absolute -z-10 top-1/2 left-1/2 h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-36">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, type: "spring" }}
            className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary via-primary to-accent px-10 py-20 text-center sm:px-20 sm:py-28"
          >
            <h2 className="mx-auto max-w-3xl text-balance text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl">
              Ready to transform how your team ships?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-xl text-primary-foreground/85">
              Join thousands of teams already using ProjectFlow to ship better
              products, faster.
            </p>
            <div className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row">
              <Link href="/register">
                <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="min-w-[220px] rounded-2xl py-7 text-base font-bold shadow-xl"
                  >
                    Start for free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 left-0 h-40 w-40 rounded-full bg-primary-foreground/10 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-primary-foreground/10 blur-3xl" />
            <div className="absolute top-1/2 right-1/4 h-32 w-32 rounded-full bg-accent/20 blur-2xl" />
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
                <Layers className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">ProjectFlow</span>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Built with care for modern engineering teams.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
