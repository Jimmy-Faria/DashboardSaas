"use client";

import { motion } from "framer-motion";
import { User, Bell, Palette, Shield, CreditCard, HelpCircle } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const settingsSections = [
  {
    id: "profile",
    title: "Profile",
    description: "Manage your personal information and preferences",
    icon: User,
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Configure how you receive alerts and updates",
    icon: Bell,
  },
  {
    id: "appearance",
    title: "Appearance",
    description: "Customize the look and feel of your workspace",
    icon: Palette,
  },
  {
    id: "security",
    title: "Security",
    description: "Manage your account security and authentication",
    icon: Shield,
  },
  {
    id: "billing",
    title: "Billing",
    description: "View and manage your subscription and payments",
    icon: CreditCard,
  },
  {
    id: "help",
    title: "Help & Support",
    description: "Get help with ProjectFlow and contact support",
    icon: HelpCircle,
  },
];

export default function SettingsPage() {
  return (
    <AppLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </motion.div>

      {/* Settings Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {settingsSections.map((section, index) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="group cursor-pointer"
            >
              <div className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-lg">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10"
                >
                  <Icon className="h-6 w-6 text-primary" />
                </motion.div>
                <h3 className="mb-1 text-lg font-semibold group-hover:text-primary transition-colors">
                  {section.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {section.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="mt-12"
      >
        <h2 className="mb-4 text-lg font-semibold text-destructive">Danger Zone</h2>
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold">Delete Account</h3>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data.
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Delete Account
            </Button>
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
}
